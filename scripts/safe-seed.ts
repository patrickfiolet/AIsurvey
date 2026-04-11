/**
 * Safe Seed Script — No duplicates
 * Only creates records if they don't already exist.
 *
 * Usage: npx tsx scripts/safe-seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('\ud83c\udf31 Safe seeding database...')

  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@aisurvey.me' } })
  if (!adminExists) {
    const password = await bcrypt.hash('admin123', 12)
    await prisma.user.create({
      data: { email: 'admin@aisurvey.me', name: 'Admin', password, role: 'ADMIN' },
    })
    console.log('\u2713 Admin user created')
  } else {
    console.log('\u2022 Admin user already exists')
  }

  const surveyCount = await prisma.survey.count()
  if (surveyCount === 0) {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@aisurvey.me' } })
    if (admin) {
      await prisma.survey.create({
        data: {
          title: 'IT Organization Assessment',
          description: 'Default conversational assessment',
          type: 'CONVERSATIONAL',
          userId: admin.id,
        },
      })
      console.log('\u2713 Default survey created')
    }
  } else {
    console.log(`\u2022 ${surveyCount} surveys already exist`)
  }

  console.log('\n\u2705 Safe seed completed!')
}

main()
  .catch((e) => {
    console.error('\u274c Safe seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
