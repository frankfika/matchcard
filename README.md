# SoulSync - 灵魂名片

一款帮助你找到同频之人的社交名片应用。通过问答筛选机制，让真诚的人相遇。

## 功能特点

- **个人名片** - 展示你的个人标签、关于我、寻找的人
- **问答筛选** - 设置筛选问题，只有认真回答的人才能联系你
- **追问机制** - 在通过申请前可以追问，多轮沟通确保匹配质量
- **隐私保护** - 微信号等联系方式仅在通过申请后可见
- **分享链接** - 生成专属二维码或链接分享你的名片

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL (Neon)
- **ORM**: Prisma
- **认证**: NextAuth.js
- **部署**: Vercel

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入数据库连接等配置

# 同步数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

## 环境变量

```
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## 项目结构

```
├── app/                  # Next.js App Router
│   ├── actions/         # Server Actions
│   ├── api/             # API 路由
│   ├── dashboard/       # 仪表盘页面
│   └── p/[code]/        # 名片展示页
├── components/          # React 组件
│   ├── apply/          # 申请相关组件
│   ├── dashboard/      # 仪表盘组件
│   └── profile/        # 名片组件
├── lib/                 # 工具函数和配置
└── prisma/             # 数据库 Schema
```

## License

MIT
