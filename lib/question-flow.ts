export interface QuestionFlowItem {
  id: string
  phase: string
  question: string
  followUps: { trigger: string; question: string }[]
}

export const questionFlow: QuestionFlowItem[] = [
  {
    id: 'q1',
    phase: 'opening',
    question: 'Kunt u mij vertellen wat uw functie is en hoe lang u al bij de organisatie werkt?',
    followUps: [
      { trigger: 'kort', question: 'U bent er nog niet zo lang. Hoe verliep de inwerkperiode?' },
      { trigger: 'lang', question: 'Met uw ervaring, hoe heeft u de organisatie zien veranderen?' },
    ],
  },
  {
    id: 'q2',
    phase: 'context',
    question: 'Kunt u beschrijven hoe kennis momenteel wordt gedeeld binnen uw team of afdeling?',
    followUps: [
      { trigger: 'informeel', question: 'Ziet u risico\'s bij deze informele kennisdeling?' },
      { trigger: 'formeel', question: 'Hoe effectief vindt u deze formele aanpak?' },
    ],
  },
  {
    id: 'q3',
    phase: 'challenges',
    question: 'Wat zijn de grootste uitdagingen die u ervaart bij kennisoverdracht?',
    followUps: [
      { trigger: 'tijd', question: 'Hoe gaat u om met het tijdgebrek voor kennisdeling?' },
      { trigger: 'tools', question: 'Welke tools mist u het meest?' },
    ],
  },
  {
    id: 'q4',
    phase: 'tools',
    question: 'Welke tools of systemen gebruikt u momenteel voor het vastleggen en delen van kennis?',
    followUps: [
      { trigger: 'geen', question: 'Hoe houdt u dan belangrijke informatie bij?' },
      { trigger: 'veel', question: 'Is er overlap tussen deze tools? Veroorzaakt dat verwarring?' },
    ],
  },
  {
    id: 'q5',
    phase: 'frequency',
    question: 'Hoe vaak vindt er bewuste kennisoverdracht plaats? Denk aan trainingen, mentoring of documentatie.',
    followUps: [
      { trigger: 'zelden', question: 'Wat zou u motiveren om vaker kennis te delen?' },
      { trigger: 'regelmatig', question: 'Wat maakt deze sessies effectief?' },
    ],
  },
  {
    id: 'q6',
    phase: 'critical_knowledge',
    question: 'Welke kritische kennis dreigt verloren te gaan, bijvoorbeeld door pensionering of vertrek van medewerkers?',
    followUps: [
      { trigger: 'specifiek', question: 'Zijn er al stappen ondernomen om deze kennis vast te leggen?' },
      { trigger: 'onbekend', question: 'Hoe zou u deze kennisrisico\'s beter in kaart kunnen brengen?' },
    ],
  },
  {
    id: 'q7',
    phase: 'culture',
    question: 'Hoe zou u de kenniscultuur binnen uw organisatie omschrijven?',
    followUps: [
      { trigger: 'open', question: 'Wat draagt bij aan deze open cultuur?' },
      { trigger: 'gesloten', question: 'Wat zijn de barrières voor het delen van kennis?' },
    ],
  },
  {
    id: 'q8',
    phase: 'improvements',
    question: 'Als u één ding zou mogen veranderen aan hoe kennis wordt beheerd, wat zou dat zijn?',
    followUps: [
      { trigger: 'systeem', question: 'Welke functionaliteiten zou dit ideale systeem moeten hebben?' },
      { trigger: 'proces', question: 'Hoe zou u dit nieuwe proces implementeren?' },
    ],
  },
  {
    id: 'q9',
    phase: 'ai_experience',
    question: 'Wat is uw ervaring met AI-tools of slimme systemen die kenniswerk ondersteunen?',
    followUps: [
      { trigger: 'positief', question: 'Welke AI-toepassingen zou u graag meer willen zien?' },
      { trigger: 'geen', question: 'Zou u openstaan voor AI-ondersteuning bij kennisoverdracht?' },
    ],
  },
  {
    id: 'q10',
    phase: 'closing',
    question: 'Is er nog iets dat u wilt toevoegen over kennisoverdracht dat we niet hebben besproken?',
    followUps: [],
  },
]

export function getQuestionByPhase(phase: string): QuestionFlowItem | undefined {
  return questionFlow?.find?.((q: any) => q?.phase === phase)
}

export function getNextPhase(currentPhase: string): string | null {
  const idx = questionFlow?.findIndex?.((q: any) => q?.phase === currentPhase) ?? -1
  if (idx < 0 || idx >= (questionFlow?.length ?? 0) - 1) return null
  return questionFlow?.[idx + 1]?.phase ?? null
}
