# TipArena v2 设置指南

## 🚀 快速开始

### 1. 环境变量配置

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local`，填入你的 Supabase 配置信息。

### 2. Supabase 数据库设置

在你的 Supabase 项目中，运行以下 SQL 创建 `rooms` 表：

```sql
-- 创建 rooms 表
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 2,
  rule TEXT NOT NULL,
  amount_per_person DECIMAL(10, 2) NOT NULL DEFAULT 0,
  owner_address TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 启用实时订阅
ALTER TABLE public.rooms REPLICA IDENTITY FULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);

-- 设置 RLS (Row Level Security) - 可选
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Enable read access for all users" ON public.rooms
  FOR SELECT USING (true);

-- 允许所有人插入
CREATE POLICY "Enable insert for all users" ON public.rooms
  FOR INSERT WITH CHECK (true);

-- 只允许房主更新
CREATE POLICY "Enable update for room owners" ON public.rooms
  FOR UPDATE USING (true);
```

### 3. 安装依赖

```bash
npm install
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📋 功能清单

### ✅ 已完成功能

- [x] Solana 钱包集成 (Phantom, Solflare)
- [x] Supabase 数据库配置和类型安全
- [x] 首页组队大厅
  - [x] 暗黑电竞风格 UI（金色渐变）
  - [x] 实时显示活跃游戏请求
  - [x] 游戏卡片展示（游戏名、人数槽位、金额）
  - [x] 发布游戏请求模态框
- [x] 动态房间页面 (`/room/[id]`)
  - [x] 实时房间状态更新
  - [x] 玩家列表展示
  - [x] 结算和支付功能
  - [x] Solana 链上转账
- [x] 病毒式分享卡片
  - [x] "50x SKILL DIFF" 胜利海报
  - [x] 下载为图片功能
  - [x] 彩带动画效果

## 🎮 使用流程

1. **连接钱包**: 点击右上角 "Select Wallet" 连接 Phantom 或 Solflare 钱包
2. **浏览游戏**: 在首页查看当前活跃的游戏请求
3. **发布请求**: 点击 "发布游戏请求" 按钮创建新房间
4. **加入房间**: 点击任意游戏卡片的 "加入房间" 进入
5. **游戏结束**: 输家点击 "我是输家，立即支付" 按钮
6. **分享胜利**: 支付完成后会显示专属战绩卡片，可下载分享

## 🔧 技术栈

- **前端框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **区块链**: Solana Web3.js
- **钱包适配器**: @solana/wallet-adapter-react
- **数据库**: Supabase (PostgreSQL)
- **动画**: Framer Motion, Canvas Confetti
- **图片生成**: html2canvas
- **图标**: Lucide React

## 📦 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署！

## 🛠️ 开发注意事项

- 当前使用 Solana Devnet，生产环境需要改为 Mainnet
- 修改网络配置在 `app/components/WalletProvider.tsx`
- 所有类型都已通过 TypeScript 严格定义，确保类型安全
- Supabase 实时订阅已配置，房间状态会自动更新

## 🔐 安全性

- 使用 Supabase RLS (Row Level Security) 保护数据
- 钱包私钥永远不会发送到服务器
- 所有链上交易都需要用户签名确认

## 📝 TODO (未来增强)

- [ ] 添加玩家邀请链接
- [ ] 集成多人房间管理
- [ ] 添加游戏历史记录
- [ ] 支持更多支付代币 (USDC, USDT)
- [ ] 添加聊天功能
- [ ] 实现评分和声誉系统

## 💬 支持

如有问题，请查看：
- [Solana 文档](https://docs.solana.com/)
- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
