# 好事坏事记录网站

## 简介
简约清好事坏事记录网站，支持两个用户记录生活中的好事和坏事，数据实时互通。

## 技术栈
- **前端**: HTML, CSS, JavaScript
- **存储**: Supabase (免费方案)
- **部署**: GitHub Pages

## 核心功能
- 两个按钮：绿色（好事）、红色（坏事）
- 点击后弹出输入框记录事件
- 历史记录列表显示：时间、内容、记录人、好事/坏事标签、对象
- 统计面板：两个用户的好事/坏事数量（共4个统计）

## 核心文件
| 文件 | 说明 |
|------|------|
| index.html | 主页面 |
| style.css | 样式文件 |
| script.js | 逻辑代码 |
| supabase.js | 数据库配置 |
| SUPABASE_SETUP.md | Supabase 配置指南 |
| DEPLOY.md | GitHub Pages 部署指南 |

## 快速开始

### 1. 配置 Supabase
按照 [SUPABASE_SETUP.md](SUPABASE_SETUP.md) 创建数据库并获取配置信息。

### 2. 更新配置
打开 `supabase.js`，替换为你的 Supabase 配置：
```javascript
const SUPABASE_URL = 'https://你的项目ID.supabase.co';
const SUPABASE_ANON_KEY = '你的anon_key';
```

### 3. 本地测试
直接在浏览器中打开 `index.html` 即可测试。

### 4. 部署上线
按照 [DEPLOY.md](DEPLOY.md) 部署到 GitHub Pages。

## 注意事项
- 使用 Supabase 免费层，支持实时数据同步
- 无需登录，两个用户直接使用
- 数据库需要提前配置好表结构

## 进度
- [x] 创建前端页面
- [x] 实现记录功能
- [x] 实现历史记录展示
- [x] 实现统计功能
- [ ] 配置 Supabase 数据库（需要用户操作）
- [ ] 部署到 GitHub Pages（需要用户操作）
