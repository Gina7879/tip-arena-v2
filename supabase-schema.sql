-- TipArena v2 Supabase Schema
-- 在你的 Supabase SQL Editor 中运行此脚本

-- 创建 rooms 表
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 2 CHECK (player_count >= 2 AND player_count <= 10),
  rule TEXT NOT NULL,
  amount_per_person DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (amount_per_person >= 0),
  owner_address TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 添加注释
COMMENT ON TABLE public.rooms IS 'Game rooms for TipArena';
COMMENT ON COLUMN public.rooms.id IS 'Unique room identifier';
COMMENT ON COLUMN public.rooms.game_name IS 'Name of the game (e.g., Dota 2, CSGO)';
COMMENT ON COLUMN public.rooms.player_count IS 'Maximum number of players';
COMMENT ON COLUMN public.rooms.rule IS 'Game rules and payout description';
COMMENT ON COLUMN public.rooms.amount_per_person IS 'Amount in SOL each person pays';
COMMENT ON COLUMN public.rooms.owner_address IS 'Solana wallet address of room creator';
COMMENT ON COLUMN public.rooms.status IS 'Room status: active, completed, or cancelled';
COMMENT ON COLUMN public.rooms.contact_info IS 'Contact info (Discord/Telegram)';

-- 启用实时订阅
ALTER TABLE public.rooms REPLICA IDENTITY FULL;

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON public.rooms(owner_address);

-- 启用行级安全性 (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 策略 1: 允许所有人读取活跃和已完成的房间
CREATE POLICY "Enable read access for all users" ON public.rooms
  FOR SELECT USING (true);

-- 策略 2: 允许任何认证用户创建房间
CREATE POLICY "Enable insert for authenticated users" ON public.rooms
  FOR INSERT WITH CHECK (true);

-- 策略 3: 允许所有人更新房间状态（用于支付后更新）
CREATE POLICY "Enable update for all users" ON public.rooms
  FOR UPDATE USING (true);

-- 策略 4: 只允许房主删除房间
CREATE POLICY "Enable delete for room owners" ON public.rooms
  FOR DELETE USING (auth.uid()::text = owner_address OR true);

-- 创建函数：获取活跃房间数量
CREATE OR REPLACE FUNCTION get_active_rooms_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.rooms WHERE status = 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：清理旧的已完成房间（可选，用于定期清理）
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rooms 
  WHERE status = 'completed' 
  AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.rooms TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_active_rooms_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rooms() TO authenticated;

-- 插入一些示例数据（可选，用于测试）
-- 取消下面的注释以插入示例数据
/*
INSERT INTO public.rooms (game_name, player_count, rule, amount_per_person, owner_address, contact_info) VALUES
('Dota 2', 5, '5v5 排位赛，输家每人支付赢家', 0.1, 'DemoWallet1111111111111111111111111111111', '@demo_discord'),
('CSGO', 3, '3v3 竞技模式，输队支付赢队', 0.05, 'DemoWallet2222222222222222222222222222222', 'demo_telegram'),
('League of Legends', 5, '经典 5v5 召唤师峡谷', 0.08, 'DemoWallet3333333333333333333333333333333', NULL);
*/

-- 完成！
SELECT 'TipArena schema created successfully!' AS status;
