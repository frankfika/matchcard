const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function ensureUser(
  prisma,
  { name, email, password, themeColor = 'zinc', gender = 'Female', targetGender = 'Male', contactWechat }
) {
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
            themeColor,
            gender,
            targetGender,
            contactWechat,
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
          themeColor,
          gender,
          targetGender,
          contactWechat,
        },
      })
    }
  }
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  return { user, profile }
}

async function createApplication(prisma, { fromUser, toProfile, applicantName, applicantWechat }) {
  const questions = toProfile.questions
  const answers = questions.map((q, i) => `回答${i + 1}: 喜欢${q.slice(0, 6)}...`)
  await prisma.application.create({
    data: {
      profileId: toProfile.id,
      targetUserId: toProfile.userId,
      applicantUserId: fromUser.id,
      applicantName,
      applicantWechat,
      questions,
      answers,
      status: 'pending',
    },
  })
}

async function run() {
  const prisma = new PrismaClient()

  const alice = await ensureUser(prisma, {
    name: 'Alice',
    email: 'alice@soulsync.local',
    password: 'test1234',
    themeColor: 'rose',
    gender: 'Female',
    targetGender: 'Male',
    contactWechat: 'wx_alice_001',
  })
  const bob = await ensureUser(prisma, {
    name: 'Bob',
    email: 'bob@soulsync.local',
    password: 'test1234',
    themeColor: 'blue',
    gender: 'Male',
    targetGender: 'Female',
    contactWechat: 'wx_bob_001',
  })
  const carol = await ensureUser(prisma, {
    name: 'Carol',
    email: 'carol@soulsync.local',
    password: 'test1234',
    themeColor: 'emerald',
    gender: 'Female',
    targetGender: 'Male',
    contactWechat: 'wx_carol_001',
  })

  // 创建互相申请示例
  await createApplication(prisma, {
    fromUser: bob.user,
    toProfile: alice.profile,
    applicantName: 'Bob',
    applicantWechat: 'wx_bob_001',
  })
  await createApplication(prisma, {
    fromUser: carol.user,
    toProfile: bob.profile,
    applicantName: 'Carol',
    applicantWechat: 'wx_carol_001',
  })

  // 输出测试账号与链接
  const outputs = [alice, bob, carol].map(({ user, profile }) => ({
    email: user.email,
    password: 'test1234',
    nickname: profile.nickname,
    shareCode: profile.shareCode,
    shareUrl: `http://localhost:3002/p/${profile.shareCode}`,
  }))
  console.log(JSON.stringify(outputs, null, 2))
  await prisma.$disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
