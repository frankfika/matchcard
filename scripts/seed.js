const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function run() {
  const prisma = new PrismaClient()
  const email = 'test@soulsync.local'
  const name = 'Test User'
  const password = 'test1234'
  const hash = await bcrypt.hash(password, 12)

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        profile: {
          create: {
            nickname: name,
            title: '寻找同频灵魂',
            tags: ['90后', '创业', 'Web3/AI'],
            aboutMe: ['热爱生活', '喜欢编码', '真诚直率'],
            lookingFor: ['心智成熟', '认知同频'],
            questions: ['你的兴趣是什么？', '理想的周末怎么过？', '你最看重伴侣的什么？'],
            themeColor: 'zinc',
            gender: 'Female',
            targetGender: 'Male',
          },
        },
      },
    })
  } else {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
    if (!profile) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          nickname: name,
          title: '寻找同频灵魂',
          tags: ['90后', '创业', 'Web3/AI'],
          aboutMe: ['热爱生活', '喜欢编码', '真诚直率'],
          lookingFor: ['心智成熟', '认知同频'],
          questions: ['你的兴趣是什么？', '理想的周末怎么过？', '你最看重伴侣的什么？'],
          themeColor: 'zinc',
          gender: 'Female',
          targetGender: 'Male',
        },
      })
    }
  }

  const createdProfile = await prisma.profile.findUnique({ where: { userId: user.id } })
  console.log(JSON.stringify({ email, password, shareCode: createdProfile.shareCode }))
  await prisma.$disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
