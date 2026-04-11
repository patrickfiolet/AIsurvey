/**
 * Database Seed Script
 * Creates admin user and test survey with questions.
 *
 * Usage: npx tsx scripts/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('\ud83c\udf31 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aisurvey.me' },
    update: {},
    create: {
      email: 'admin@aisurvey.me',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('\u2713 Admin user created:', admin.email)

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 12)
  const editor = await prisma.user.upsert({
    where: { email: 'editor@aisurvey.me' },
    update: {},
    create: {
      email: 'editor@aisurvey.me',
      name: 'Editor',
      password: editorPassword,
      role: 'EDITOR',
    },
  })
  console.log('\u2713 Editor user created:', editor.email)

  // Create Conversational Survey (default template)
  const defaultSurvey = await prisma.survey.create({
    data: {
      title: 'IT Organization Assessment',
      description: 'AI-driven assessment of your IT organization and knowledge landscape',
      type: 'CONVERSATIONAL',
      userId: admin.id,
      welcomeText: 'Welcome! This AI-driven assessment will help us understand your organization. I will ask you 10 questions about your IT landscape, challenges, and vision.',
      thankYouText: 'Thank you for participating! Your insights are invaluable for understanding your organization.',
    },
  })
  console.log('\u2713 Default conversational survey created:', defaultSurvey.title)

  // Create SAP Knowledge Survey (SAP template)
  const sapSurvey = await prisma.survey.create({
    data: {
      title: 'SAP Knowledge Extraction',
      description: 'Targeted knowledge capture for SAP consultants and key users',
      type: 'CONVERSATIONAL',
      templateId: 'sap-knowledge',
      templateName: 'SAP Knowledge Extraction',
      userId: admin.id,
      welcomeText: 'Welcome! This session will help us capture your SAP expertise and tacit knowledge.',
      thankYouText: 'Thank you! Your SAP knowledge has been captured for organizational knowledge retention.',
    },
  })
  console.log('\u2713 SAP knowledge survey created:', sapSurvey.title)

  // Create Static Survey with questions
  const staticSurvey = await prisma.survey.create({
    data: {
      title: 'Quick IT Assessment',
      description: 'A brief static survey about your IT landscape',
      type: 'STATIC',
      userId: admin.id,
      questions: {
        create: [
          { text: 'What is your organization\'s core business?', type: 'OPEN_TEXT', order: 1 },
          { text: 'Which IT systems do you currently use?', type: 'OPEN_TEXT', order: 2 },
          { text: 'How satisfied are you with your IT?', type: 'RATING_SCALE', order: 3 },
          { text: 'What are your biggest IT challenges?', type: 'OPEN_TEXT', order: 4 },
          { text: 'Do you use cloud services?', type: 'YES_NO', order: 5 },
        ],
      },
    },
  })
  console.log('\u2713 Static survey with questions created:', staticSurvey.title)

  // Create Voice Agent Questions
  await prisma.voiceAgentQuestion.createMany({
    data: [
      { questionText: 'Kunt u kort uw organisatie beschrijven?', order: 1, surveyId: defaultSurvey.id },
      { questionText: 'Welke IT-systemen gebruikt u momenteel?', order: 2, surveyId: defaultSurvey.id },
      { questionText: 'Wat zijn de grootste uitdagingen in uw IT-omgeving?', order: 3, surveyId: defaultSurvey.id },
      { questionText: 'Hoe gaat uw organisatie om met cybersecurity?', order: 4, surveyId: defaultSurvey.id },
      { questionText: 'Wat is uw visie op AI en automatisering?', order: 5, surveyId: defaultSurvey.id },
    ],
  })
  console.log('\u2713 Voice agent questions created')

  // Create sample Expert Profile
  await prisma.expertProfile.create({
    data: {
      name: 'Jan de Vries',
      email: 'jan@example.com',
      role: 'SAP FI/CO Consultant',
      department: 'IT',
      organization: 'Example Corp',
      knowledgeDomains: ['SAP FI', 'SAP CO', 'Month-end closing'],
      riskLevel: 'HIGH',
      notes: 'Senior consultant with 15 years of SAP experience. Retirement planned in 2027.',
    },
  })
  console.log('\u2713 Sample expert profile created')

  console.log('\n\u2705 Database seeded successfully!')
  console.log('\n\ud83d\udd11 Login credentials:')
  console.log('   Admin: admin@aisurvey.me / admin123')
  console.log('   Editor: editor@aisurvey.me / editor123')
}

main()
  .catch((e) => {
    console.error('\u274c Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
