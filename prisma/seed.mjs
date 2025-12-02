import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('test123', 10)

  // 用户1: 小红
  const user1 = await prisma.user.upsert({
    where: { email: 'xiaohong@test.com' },
    update: {},
    create: {
      email: 'xiaohong@test.com',
      name: '小红',
      password,
      profile: {
        create: {
          nickname: '小红',
          title: '寻找有趣的灵魂',
          tags: ['读书', '旅行', '咖啡'],
          aboutMe: ['互联网产品经理，坐标北京', '喜欢周末去咖啡馆看书', 'INFJ，安静但不无聊'],
          lookingFor: ['有稳定工作和生活目标', '喜欢深度交流', '不抽烟不酗酒'],
          questions: ['你最近在读什么书？', '周末一般怎么度过？', '你理想中的生活是什么样的？'],
          contactWechat: 'xiaohong_test',
          contactEmail: 'xiaohong@test.com',
          themeColor: 'rose',
          gender: 'Female',
          targetGender: 'Male',
        }
      }
    }
  })

  // 用户2: 小明
  const user2 = await prisma.user.upsert({
    where: { email: 'xiaoming@test.com' },
    update: {},
    create: {
      email: 'xiaoming@test.com',
      name: '小明',
      password,
      profile: {
        create: {
          nickname: '小明',
          title: '代码与生活的平衡者',
          tags: ['编程', '健身', '摄影'],
          aboutMe: ['全栈工程师，喜欢技术也喜欢生活', '每周健身3次，保持好身材', '业余摄影爱好者'],
          lookingFor: ['独立有主见', '热爱生活', '能聊得来'],
          questions: ['你对另一半最看重的品质是什么？', '你有什么兴趣爱好？', '未来5年有什么计划？'],
          contactWechat: 'xiaoming_test',
          contactEmail: 'xiaoming@test.com',
          themeColor: 'blue',
          gender: 'Male',
          targetGender: 'Female',
        }
      }
    }
  })

  // 用户3: 小芳
  const user3 = await prisma.user.upsert({
    where: { email: 'xiaofang@test.com' },
    update: {},
    create: {
      email: 'xiaofang@test.com',
      name: '小芳',
      password,
      profile: {
        create: {
          nickname: '小芳',
          title: '生活需要一点甜',
          tags: ['烘焙', '追剧', '猫奴'],
          aboutMe: ['设计师一枚，审美在线', '家里有两只猫主子', '擅长做甜点，朋友圈美食博主'],
          lookingFor: ['温柔体贴', '喜欢小动物', '有责任心'],
          questions: ['你喜欢猫还是狗？', '你会做饭吗？', '你觉得爱情中最重要的是什么？'],
          contactWechat: 'xiaofang_test',
          contactEmail: 'xiaofang@test.com',
          themeColor: 'amber',
          gender: 'Female',
          targetGender: 'Male',
        }
      }
    }
  })

  // 获取 shareCode
  const profiles = await prisma.profile.findMany({
    select: { nickname: true, shareCode: true },
    where: { userId: { in: [user1.id, user2.id, user3.id] } }
  })

  console.log('\n✅ 测试账号创建成功！\n')
  console.log('登录密码统一为: test123\n')
  console.log('账号列表:')
  console.log('─'.repeat(50))
  console.log('邮箱                    | 名片链接')
  console.log('─'.repeat(50))
  profiles.forEach(p => {
    console.log(`${p.nickname.padEnd(6)} (${p.nickname}@test.com)`)
    console.log(`  → http://localhost:3000/p/${p.shareCode}`)
  })
  console.log('─'.repeat(50))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
