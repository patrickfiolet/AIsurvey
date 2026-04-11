/**
 * Knowledge Graph Service — v2.0
 *
 * Manages knowledge nodes and edges for the knowledge graph.
 * Currently uses PostgreSQL (via Prisma). Future: Neo4j migration path.
 */

import { prisma } from './db'
import type { KnowledgeGraphData, KnowledgeNodeData, KnowledgeEdgeData } from './types'

// ============================================================
// Node Operations
// ============================================================

/** Create or update a knowledge node */
export async function upsertKnowledgeNode(params: {
  nodeType: string
  label: string
  description?: string
  domain?: string
  confidence?: number
  metadata?: Record<string, unknown>
  expertProfileId?: number
}): Promise<KnowledgeNodeData> {
  // Check for existing node with same type and label
  const existing = await prisma.knowledgeNode.findFirst({
    where: {
      nodeType: params.nodeType as any,
      label: params.label,
    },
  })

  if (existing) {
    // Update confidence (increase) and metadata
    const updatedNode = await prisma.knowledgeNode.update({
      where: { id: existing.id },
      data: {
        confidence: Math.min(1.0, (existing.confidence + (params.confidence || 0.8)) / 2 + 0.05),
        description: params.description || existing.description,
        domain: params.domain || existing.domain,
        metadata: params.metadata as any || existing.metadata,
        expertProfileId: params.expertProfileId || existing.expertProfileId,
      },
    })
    return mapNode(updatedNode)
  }

  const node = await prisma.knowledgeNode.create({
    data: {
      nodeType: params.nodeType as any,
      label: params.label,
      description: params.description,
      domain: params.domain,
      confidence: params.confidence || 0.8,
      metadata: params.metadata as any,
      expertProfileId: params.expertProfileId,
    },
  })
  return mapNode(node)
}

/** Create a knowledge edge between two nodes */
export async function createKnowledgeEdge(params: {
  edgeType: string
  fromNodeId: number
  toNodeId: number
  label?: string
  weight?: number
  metadata?: Record<string, unknown>
}): Promise<KnowledgeEdgeData> {
  // Check for existing edge
  const existing = await prisma.knowledgeEdge.findFirst({
    where: {
      edgeType: params.edgeType as any,
      fromNodeId: params.fromNodeId,
      toNodeId: params.toNodeId,
    },
  })

  if (existing) {
    const updated = await prisma.knowledgeEdge.update({
      where: { id: existing.id },
      data: {
        weight: Math.min(10, (existing.weight + (params.weight || 1.0))),
      },
    })
    return mapEdge(updated)
  }

  const edge = await prisma.knowledgeEdge.create({
    data: {
      edgeType: params.edgeType as any,
      fromNodeId: params.fromNodeId,
      toNodeId: params.toNodeId,
      label: params.label,
      weight: params.weight || 1.0,
      metadata: params.metadata as any,
    },
  })
  return mapEdge(edge)
}

// ============================================================
// Graph Queries
// ============================================================

/** Get the full knowledge graph (or filtered by domain) */
export async function getKnowledgeGraph(filters?: {
  domain?: string
  nodeType?: string
  expertProfileId?: number
}): Promise<KnowledgeGraphData> {
  const nodeWhere: any = {}
  if (filters?.domain) nodeWhere.domain = filters.domain
  if (filters?.nodeType) nodeWhere.nodeType = filters.nodeType
  if (filters?.expertProfileId) nodeWhere.expertProfileId = filters.expertProfileId

  const nodes = await prisma.knowledgeNode.findMany({
    where: nodeWhere,
    orderBy: { confidence: 'desc' },
  })

  const nodeIds = nodes.map((n) => n.id)

  const edges = await prisma.knowledgeEdge.findMany({
    where: {
      OR: [
        { fromNodeId: { in: nodeIds } },
        { toNodeId: { in: nodeIds } },
      ],
    },
  })

  return {
    nodes: nodes.map(mapNode),
    edges: edges.map(mapEdge),
  }
}

/** Find nodes connected to a specific person node (for "what if person leaves" analysis) */
export async function getKnowledgeAtRisk(personNodeId: number): Promise<KnowledgeGraphData> {
  const edges = await prisma.knowledgeEdge.findMany({
    where: {
      OR: [
        { fromNodeId: personNodeId },
        { toNodeId: personNodeId },
      ],
    },
    include: {
      fromNode: true,
      toNode: true,
    },
  })

  const nodeMap = new Map<number, any>()
  for (const edge of edges) {
    nodeMap.set(edge.fromNode.id, edge.fromNode)
    nodeMap.set(edge.toNode.id, edge.toNode)
  }

  return {
    nodes: Array.from(nodeMap.values()).map(mapNode),
    edges: edges.map(mapEdge),
  }
}

// ============================================================
// Entity-to-Graph Pipeline
// ============================================================

/** Process extracted entities from a conversation into knowledge graph nodes/edges */
export async function processEntitiesToGraph(
  entities: Array<{
    type: string
    value: string
    confidence: number
    context?: string
  }>,
  domain?: string,
  expertProfileId?: number
): Promise<void> {
  const createdNodes: Map<string, KnowledgeNodeData> = new Map()

  // Create nodes for each entity
  for (const entity of entities) {
    const nodeType = mapEntityTypeToNodeType(entity.type)
    if (!nodeType) continue

    const node = await upsertKnowledgeNode({
      nodeType,
      label: entity.value,
      description: entity.context,
      domain,
      confidence: entity.confidence,
      expertProfileId,
    })

    createdNodes.set(`${entity.type}:${entity.value}`, node)
  }

  // Create edges between related entities
  const nodeEntries = Array.from(createdNodes.entries())
  for (let i = 0; i < nodeEntries.length; i++) {
    for (let j = i + 1; j < nodeEntries.length; j++) {
      const [keyA, nodeA] = nodeEntries[i]
      const [keyB, nodeB] = nodeEntries[j]
      const typeA = keyA.split(':')[0]
      const typeB = keyB.split(':')[0]

      const edgeType = inferEdgeType(typeA, typeB)
      if (edgeType) {
        await createKnowledgeEdge({
          edgeType,
          fromNodeId: nodeA.id,
          toNodeId: nodeB.id,
        })
      }
    }
  }
}

// ============================================================
// Helpers
// ============================================================

function mapEntityTypeToNodeType(entityType: string): string | null {
  const mapping: Record<string, string> = {
    person: 'PERSON',
    system: 'SYSTEM',
    process: 'PROCESS',
    risk: 'RISK',
    department: 'DEPARTMENT',
    decision_context: 'DECISION',
    workaround: 'WORKAROUND',
    exception: 'EXCEPTION',
    technology: 'SYSTEM',
    tool: 'SYSTEM',
    kpi: 'PROCESS',
  }
  return mapping[entityType] || null
}

function inferEdgeType(typeA: string, typeB: string): string | null {
  if (typeA === 'person' && typeB === 'process') return 'KNOWS_ABOUT'
  if (typeA === 'person' && typeB === 'system') return 'USES'
  if (typeA === 'person' && typeB === 'department') return 'WORKS_WITH'
  if (typeA === 'process' && typeB === 'system') return 'DEPENDS_ON'
  if (typeA === 'exception' && typeB === 'process') return 'EXCEPTION_OF'
  if (typeA === 'workaround' && typeB === 'system') return 'ALTERNATIVE_TO'
  if (typeA === 'decision_context' && typeB === 'process') return 'DECIDED_BY'
  if (typeA === 'process' && typeB === 'risk') return 'DEPENDS_ON'
  // Symmetric fallback
  if (typeB === 'person') return inferEdgeType(typeB, typeA)
  return 'WORKS_WITH'
}

function mapNode(node: any): KnowledgeNodeData {
  return {
    id: node.id,
    nodeType: node.nodeType,
    label: node.label,
    description: node.description,
    domain: node.domain,
    confidence: node.confidence,
    metadata: node.metadata,
  }
}

function mapEdge(edge: any): KnowledgeEdgeData {
  return {
    id: edge.id,
    edgeType: edge.edgeType,
    label: edge.label,
    weight: edge.weight,
    fromNodeId: edge.fromNodeId,
    toNodeId: edge.toNodeId,
  }
}
