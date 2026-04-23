import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const adminUser = await prisma.user.findUnique({ where: { email: 'john@doe.com' } })
  if (!adminUser) throw new Error('Admin user not found')

  // Create default survey
  const survey = await prisma.survey.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Kennisoverdracht Survey',
      description: 'Help ons uw organisatie beter te begrijpen op het gebied van kennisoverdracht.',
      welcomeText: 'Welkom bij onze AI-gedreven survey. Uw antwoorden helpen ons waardevolle inzichten te verkrijgen over kennisoverdracht binnen uw organisatie.',
      thankYouText: 'Dank u voor uw deelname! Uw antwoorden zijn opgeslagen en zullen bijdragen aan waardevolle inzichten.',
      isActive: true,
      isAnonymous: false,
      surveyType: 'STATIC',
      createdById: adminUser.id,
    },
  })

  // Create 10 default questions
  const questions = [
    'Wat is uw functie binnen de organisatie?',
    'Hoe lang werkt u al bij deze organisatie?',
    'Hoe wordt kennis momenteel gedeeld binnen uw team?',
    'Welke uitdagingen ervaart u bij het overdragen van kennis?',
    'Welke tools of systemen gebruikt u voor kennisdeling?',
    'Hoe vaak vindt er formele kennisoverdracht plaats?',
    'Wat zijn de belangrijkste kennisgebieden die verloren dreigen te gaan?',
    'Hoe zou u de kenniscultuur binnen uw organisatie beschrijven?',
    'Welke verbeteringen zou u voorstellen voor kennisoverdracht?',
    'Wat is uw ervaring met AI-ondersteunde kennissystemen?',
  ]

  for (let i = 0; i < questions.length; i++) {
    await prisma.question.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        surveyId: survey.id,
        title: questions[i],
        type: 'OPEN_TEXT',
        isRequired: true,
        order: i + 1,
      },
    })
  }

  // Create conversational survey
  await prisma.survey.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Conversationeel Interview',
      description: 'Een AI-gestuurd conversationeel interview over kennisoverdracht.',
      welcomeText: 'Welkom! Ik ga u een aantal vragen stellen in een natuurlijk gesprek.',
      thankYouText: 'Bedankt voor het gesprek! Uw inzichten zijn zeer waardevol.',
      isActive: true,
      isAnonymous: false,
      surveyType: 'CONVERSATIONAL',
      createdById: adminUser.id,
    },
  })

  // Create Sales Kennisborging survey (Conversationeel)
  const salesSurvey = await prisma.survey.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Sales Kennisborging — Accountkennis & Relatiemanagement',
      description: 'Deze survey legt de impliciete kennis van ervaren salesprofessionals vast over hun accounts, klantrelaties, contracthistorie en marktinzichten — voordat deze kennis verloren gaat.',
      welcomeText: 'Welkom bij de Sales Kennisborging survey. Het doel is om uw waardevolle accountkennis en jarenlange ervaring vast te leggen, zodat deze kennis behouden blijft voor de organisatie. Neem de tijd om zo volledig mogelijk te antwoorden.',
      thankYouText: 'Hartelijk dank voor het delen van uw kennis! Uw inzichten zijn van onschatbare waarde voor de continuïteit van onze klantrelaties.',
      isActive: true,
      isAnonymous: false,
      surveyType: 'CONVERSATIONAL',
      createdById: adminUser.id,
    },
  })

  const salesQuestions = [
    'Hoe zou je de relatie met je belangrijkste accounts omschrijven, en wat maakt die relatie uniek?',
    'Waarom zijn de huidige contractvoorwaarden zo opgesteld, en wat waren de belangrijkste discussiepunten tijdens de onderhandeling?',
    'Wat heeft er in het verleden gespeeld bij dit account — wat ging er fout en hoe is het opgelost?',
    'Wie beslist er écht bij de klant, en welke interne politiek speelt er?',
    'Welke afspraken of werkwijzen zijn ooit zo ontstaan, en weet je nog waarom?',
    'Wat speelt er op dit moment bij het account, en welke kansen en bedreigingen zie je op de lange termijn?',
    'Wat speelt er in de markt of branche van de klant dat invloed heeft op jullie samenwerking?',
    'Welke informatie over dit account staat niet in het CRM, maar zou een opvolger absoluut moeten weten?',
    'Als jij morgen zou stoppen, wat zou er als eerste misgaan bij dit account?',
    'Welke lessen heb je geleerd in de omgang met dit account die je een opvolger als eerste zou meegeven?',
  ]

  for (let i = 0; i < salesQuestions.length; i++) {
    await prisma.question.upsert({
      where: { id: 100 + i + 1 },
      update: {},
      create: {
        surveyId: salesSurvey.id,
        title: salesQuestions[i],
        type: 'OPEN_TEXT',
        isRequired: true,
        order: i + 1,
      },
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
