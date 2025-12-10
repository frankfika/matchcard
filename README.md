# SoulSync - 灵魂名片

一款帮助你找到同频之人的社交名片应用。通过问答筛选机制，让真诚的人相遇。

## 核心功能

### 个人名片
- 创建精美的个人名片，展示昵称、标语、个人标签
- 填写「关于我」和「寻找的人」，让他人快速了解你
- 支持多种主题配色，打造个性化名片
- 设置性别和期望匹配对象（Boy/Girl/Any）

### 问答筛选机制
- 设置 1-3 个筛选问题，只有认真回答的人才能联系你
- **追问功能**：在通过申请前可以多轮追问，深入了解申请者
- 申请者需回答追问后，你才能看到完整信息并做决定

### 隐私保护
- 微信号、邮箱等联系方式仅在通过申请后可见
- 未通过申请的用户无法获取你的任何联系方式

### 分享与传播
- 每张名片生成唯一分享码和链接
- 自动生成二维码，方便社交场合分享
- 支持一键导出名片图片

### 申请管理
- **收件箱**：查看收到的申请，支持通过/拒绝/追问操作
- **已发送**：追踪自己发出的申请状态
- 申请状态：待处理 → 追问中 → 已回复 → 通过/拒绝
- 实时通知徽章，不错过任何消息

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router, React 19) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | PostgreSQL (Neon Serverless) |
| ORM | Prisma |
| 认证 | NextAuth.js v5 (Auth.js) |
| 表单验证 | Zod |
| AI 能力 | Google Gemini API (可选) |
| 部署 | Vercel |

## 本地开发

### 前置要求
- Node.js 18+
- PostgreSQL 数据库（推荐使用 [Neon](https://neon.tech) 免费版）

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/your-username/matchcard.git
cd matchcard

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入配置

# 同步数据库 Schema
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用。

### 可用脚本

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产服务器
npm run lint       # 代码检查
npm run db:push    # 同步数据库 Schema
npm run db:studio  # 打开 Prisma Studio 数据库管理界面
```

## 环境变量

在 `.env.local` 中配置以下变量：

```bash
# 数据库连接（必需）
DATABASE_URL="postgresql://..."           # 连接池 URL
DATABASE_URL_UNPOOLED="postgresql://..."  # 直连 URL（用于迁移）

# NextAuth 认证（必需）
AUTH_SECRET="your-auth-secret"            # 生成: openssl rand -base64 32
AUTH_URL="http://localhost:3000"          # 本地开发地址

# AI 功能（可选）
GEMINI_API_KEY="your-gemini-api-key"      # Google Gemini API Key
```

## 项目结构

```
matchcard/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面
│   │   ├── login/           # 登录页
│   │   └── register/        # 注册页
│   ├── actions/             # Server Actions
│   │   ├── auth.ts          # 认证相关
│   │   ├── profile.ts       # 名片管理
│   │   └── application.ts   # 申请处理
│   ├── api/                 # API 路由
│   │   └── auth/            # NextAuth 路由
│   ├── dashboard/           # 用户仪表盘
│   │   ├── inbox/           # 收件箱
│   │   └── sent/            # 已发送
│   ├── p/[code]/            # 公开名片页面
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/              # React 组件
│   ├── apply/               # 申请表单组件
│   ├── dashboard/           # 仪表盘组件
│   │   ├── ProfileCard.tsx  # 名片展示卡片
│   │   ├── ProfileEditor.tsx# 名片编辑器
│   │   ├── InboxList.tsx    # 收件箱列表
│   │   ├── SentList.tsx     # 已发送列表
│   │   └── DashboardNav.tsx # 导航栏
│   ├── providers/           # Context Providers
│   └── ui/                  # 通用 UI 组件
├── lib/                     # 工具函数和配置
│   ├── auth.ts              # NextAuth 配置
│   ├── db.ts                # Prisma 客户端
│   ├── types.ts             # TypeScript 类型定义
│   └── validations.ts       # Zod 验证 Schema
├── prisma/
│   └── schema.prisma        # 数据库模型定义
├── types/
│   └── next-auth.d.ts       # NextAuth 类型扩展
└── middleware.ts            # Next.js 中间件
```

## 数据模型

```
User          # 用户账户（NextAuth 管理）
  ├── Profile           # 用户名片（1:1）
  ├── receivedApplications  # 收到的申请
  └── sentApplications      # 发出的申请

Application   # 申请记录
  ├── questions/answers     # 初始问答
  ├── followUps             # 追问记录（JSON）
  └── status                # 状态流转
```

## 部署

### Vercel 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 数据库

推荐使用 [Neon](https://neon.tech) Serverless PostgreSQL：
- 免费额度足够个人使用
- 支持连接池，适配 Serverless 环境
- 自动扩缩容

## License

MIT
