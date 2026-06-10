// Supabase 配置
const SUPABASE_URL = 'https://jqetyzffngnqxwjjzhsa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZXR5emZmbmducXh3amp6aHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTk4ODUsImV4cCI6MjA5NjY3NTg4NX0.MEtTUyVllHTLZydCY4uRht--PRv9NuJMmXuldrZ018E';

// 初始化 Supabase 客户端
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 数据库表名
const TABLE_NAME = 'events';
