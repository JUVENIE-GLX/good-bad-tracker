# Supabase 配置指南

## 第一步：创建 Supabase 账号

1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project" 注册账号（可用 GitHub 登录）

## 第二步：创建项目

1. 登录后，点击 "New Project"
2. 填写信息：
   - **Organization**: 选择或创建一个组织
   - **Project name**: `good-bad-tracker`
   - **Database password**: 设置一个强密码（记住它）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
3. 点击 "Create new project"
4. 等待 1-2 分钟项目创建完成

## 第三步：创建数据表

1. 在左侧菜单点击 "SQL Editor"
2. 点击 "New query"
3. 粘贴以下 SQL 代码并点击 "Run"：

```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  object TEXT DEFAULT '无',
  user_id VARCHAR(1) NOT NULL CHECK (user_id IN ('A', 'B')),
  type VARCHAR(4) NOT NULL CHECK (type IN ('good', 'bad')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- 允许匿名访问（无需登录）
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许匿名读取" ON events
  FOR SELECT USING (true);

CREATE POLICY "允许匿名插入" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许匿名更新" ON events
  FOR UPDATE USING (true);

CREATE POLICY "允许匿名删除" ON events
  FOR DELETE USING (true);
```

## 第四步：获取配置信息

1. 在左侧菜单点击 "Project Settings"（齿轮图标）
2. 点击 "API"
3. 复制以下两个值：
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 第五步：更新代码配置

打开 `supabase.js` 文件，替换配置：

```javascript
const SUPABASE_URL = 'https://你的项目ID.supabase.co';
const SUPABASE_ANON_KEY = '你的anon_key';
```

## 完成！

现在可以在本地打开 `index.html` 测试功能了。

---

## 数据库迁移（已有项目）

如果之前已创建过数据表，需要执行以下 SQL 添加新字段：

```sql
-- 添加软删除字段
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 添加更新和删除权限
CREATE POLICY IF NOT EXISTS "允许匿名更新" ON events
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "允许匿名删除" ON events
  FOR DELETE USING (true);
```

---

## 常见问题

### Q: 数据会被删除吗？
A: Supabase 免费层有 500MB 存储空间，足够使用。项目不活跃 7 天后会暂停，但数据不会丢失。

### Q: 如何查看数据？
A: 在 Supabase 后台左侧点击 "Table Editor" 即可查看所有数据。

### Q: 两个用户如何同时使用？
A: 只要打开同一个网页地址，数据就会自动同步。部署到 GitHub Pages 后，分享链接即可。
