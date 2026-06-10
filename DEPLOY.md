# GitHub Pages 部署指南

## 第一步：创建 GitHub 仓库

1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `good-bad-tracker`
   - **Description**: 好事坏事记录网站
   - **Public**: 选择 Public（GitHub Pages 需要）
4. 点击 "Create repository"

## 第二步：上传代码

在项目目录下执行：

```bash
# 初始化 git
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始化项目"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/good-bad-tracker.git

# 推送
git push -u origin main
```

## 第三步：启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 "Settings"
2. 左侧菜单找到 "Pages"
3. **Source** 选择 "Deploy from a branch"
4. **Branch** 选择 "main"，文件夹选择 "/ (root)"
5. 点击 "Save"
6. 等待 1-2 分钟，页面会显示部署地址

## 第四步：访问网站

部署地址格式：
```
https://你的用户名.github.io/good-bad-tracker/
```

将这个链接分享给另一个人，两人即可共享数据。

---

## 更新代码后如何部署

每次修改代码后：

```bash
git add .
git commit -m "更新说明"
git push
```

GitHub Pages 会自动重新部署（约 1-2 分钟生效）。

---

## 注意事项

- 仓库必须是 **Public** 才能使用免费的 GitHub Pages
- 部署后约 1-2 分钟生效
- 如果页面空白，检查浏览器控制台是否有错误（F12）
