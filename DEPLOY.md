# 部署说明

## GitHub Pages 自动部署

本项目已配置 GitHub Actions，支持自动生成 `index.json` 和自动部署。

### 工作流程

1. **自动生成索引** (`.github/workflows/generate-index.yml`)
   - 当 `public/content` 目录下的文件发生变化时自动触发
   - 自动生成 `index.json`
   - 自动提交更新到仓库

2. **自动部署** (`.github/workflows/deploy.yml`)
   - 当推送到 `main` 分支时自动触发
   - 构建 Vue 项目
   - 部署到 GitHub Pages

### 使用方法

#### 方法一：在 GitHub 上直接添加文章

1. 在 GitHub 仓库中，进入 `public/content` 目录
2. 点击 "Add file" → "Create new file"
3. 输入文件名（如 `blog/new-article.md`）
4. 添加 frontmatter 和内容：
   ```markdown
   ---
   title: 新文章
   date: 2024-01-25
   tags: [标签1, 标签2]
   ---
   
   文章内容...
   ```
5. 提交更改

**结果**：
- GitHub Actions 会自动检测到 `content` 目录的变化
- 自动生成 `index.json`
- 自动触发重新部署
- 几分钟后，新文章就会出现在网站上

#### 方法二：本地添加后推送

1. 在本地 `public/content` 目录下添加或修改 markdown 文件
2. 提交并推送到 GitHub：
   ```bash
   git add public/content/
   git commit -m "添加新文章"
   git push
   ```

**结果**：同上，会自动生成索引并部署

### 注意事项

1. **首次部署**：需要在 GitHub 仓库设置中启用 GitHub Pages
   - Settings → Pages
   - Source: GitHub Actions

2. **手动触发**：如果自动触发失败，可以手动触发工作流
   - Actions → Generate Index → Run workflow
   - Actions → Deploy to GitHub Pages → Run workflow

3. **文件路径**：
   - 根目录文件：`public/content/article.md` → slug: `article`
   - 子目录文件：`public/content/blog/article.md` → slug: `blog/article`

### 本地开发

```bash
# 开发模式（自动监听文件变化）
pnpm dev

# 手动生成索引
pnpm run generate-index

# 构建生产版本
pnpm build
```

