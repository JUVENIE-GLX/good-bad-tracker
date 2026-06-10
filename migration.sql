-- 数据库迁移脚本：添加编辑和回收站功能
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 添加软删除字段
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. 添加更新和删除权限（如果策略不存在）
DO $$
BEGIN
  -- 检查并创建更新策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = '允许匿名更新' AND tablename = 'events'
  ) THEN
    CREATE POLICY "允许匿名更新" ON events FOR UPDATE USING (true);
  END IF;

  -- 检查并创建删除策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = '允许匿名删除' AND tablename = 'events'
  ) THEN
    CREATE POLICY "允许匿名删除" ON events FOR DELETE USING (true);
  END IF;
END $$;

-- 完成！现在可以使用编辑和回收站功能了。
