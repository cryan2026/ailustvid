# Cloudflare Pages 部署指南

## 📁 项目结构

```
cloudflare-pages/
├── index.html              # 落地页 HTML（所有资源使用外部 CDN）
└── functions/
    └── index.js            # 路由逻辑（Cookie 检查 + 参数验证）
```

## 🚀 部署步骤

### 方法一：通过 Cloudflare Dashboard（推荐）

#### 1. 准备 GitHub 仓库

```bash
cd cloudflare-pages
git init
git add .
git commit -m "Initial commit: Landing page with tracking logic"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 2. 在 Cloudflare Dashboard 中创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧菜单 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 选择您的 GitHub 仓库
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: (留空)
   - **Build output directory**: (留空，因为我们是静态文件)
6. 点击 **Save and Deploy**

#### 3. 等待部署完成

- Cloudflare 会自动检测 `functions/` 目录并启用 Functions
- 部署完成后会提供一个 `.pages.dev` 域名（如 `your-project.pages.dev`）

---

### 方法二：使用 Wrangler CLI

#### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare

```bash
wrangler login
```

#### 3. 部署项目

```bash
cd cloudflare-pages
wrangler pages deploy .
```

#### 4. 查看部署结果

部署完成后会显示访问 URL，例如：
```
✨ Success! Uploaded 2 files (0.50 sec)

✨ Deployment complete! Take a peek over at https://xxxxx.pages.dev
```

---

## ⚙️ 功能说明

### 路由逻辑

| 条件 | 行为 |
|------|------|
| ✅ 有 `_ga_f` cookie | 直接返回 `index.html` |
| ✅ 无 cookie 但 URL 包含所有追踪参数 | 返回 `index.html` 并设置新 cookie |
| ❌ 无 cookie 且缺少追踪参数 | 重定向到 `https://xxxx.xxx/` |

### Cookie 格式

- **名称**: `_ga_f`
- **值**: `GA.xxxxxxxx`（8位随机字符串）
- **有效期**: 1年（31536000秒）
- **作用域**: 整个网站（`Path=/`）
- **安全属性**: `SameSite=Lax`

### 测试 URL

假设您的域名是 `example.pages.dev`：

**✅ 应该显示页面：**
```
http://example.pages.dev/?channel_id=abc&utm_campaign=spring&utm_adset=set1&utm_ad=ad1
http://example.pages.dev/  （已有 cookie）
```

**❌ 应该重定向：**
```
http://example.pages.dev/
http://example.pages.dev/?channel_id=abc
http://example.pages.dev/?utm_campaign=spring
```

---

## 💰 费用说明

### 免费额度

- **带宽**: 100 GB/月
- **Functions 调用**: 10万次/天
- **存储空间**: 无限制
- **自定义域名**: 免费

### 预估成本

对于小型落地页项目（日访问量 < 5,000 次）：
- **月费**: $0（完全在免费额度内）✅

---

## 🔧 高级配置

### 1. 绑定自定义域名

1. 在 Cloudflare Dashboard 中找到您的 Pages 项目
2. 点击 **Custom domains** → **Set up a custom domain**
3. 输入您的域名（如 `landing.yourdomain.com`）
4. 按照提示添加 DNS 记录

### 2. 环境变量（可选）

如果需要动态配置重定向目标 URL：

1. 在 Dashboard 中找到 **Settings** → **Environment variables**
2. 添加变量：
   ```
   REDIRECT_URL = https://xxxx.xxx/
   ```
3. 修改 `functions/index.js`：
   ```javascript
   return Response.redirect(process.env.REDIRECT_URL || 'https://xxxx.xxx/', 302);
   ```

### 3. 缓存优化

当前已设置 `Cache-Control: public, max-age=3600`（缓存 1 小时）。如需调整：

```javascript
response.headers.set('Cache-Control', 'public, max-age=86400'); // 缓存 1 天
```

---

## 🐛 故障排查

### 问题 1：Functions 未生效

**症状**: 访问根路径没有重定向

**解决**:
1. 确认 `functions/index.js` 文件存在
2. 检查 Cloudflare Dashboard 中的 **Deployments** 标签，确认部署成功
3. 清除浏览器缓存后重试

### 问题 2：Cookie 未设置

**症状**: 首次访问后再次访问仍然重定向

**解决**:
1. 打开浏览器开发者工具 → Network 标签
2. 检查响应头中是否有 `Set-Cookie: _ga_f=...`
3. 检查 Application → Cookies 中是否保存了 `_ga_f`

### 问题 3：样式或脚本加载失败

**症状**: 页面显示异常

**解决**:
1. 确认 `index.html` 中所有资源 URL 都是绝对路径（使用外部 CDN）
2. 检查浏览器控制台是否有 CORS 错误
3. 确保 CDN 链接可公开访问

---

## 📊 监控与分析

### 查看访问数据

1. 登录 Cloudflare Dashboard
2. 选择您的 Pages 项目
3. 点击 **Analytics** 标签
4. 查看：
   - 请求次数
   - 带宽使用量
   - 缓存命中率
   - 错误率

### 日志调试

Cloudflare Pages Functions 支持实时日志：

```bash
wrangler pages deployment tail --project-name your-project
```

---

## 🎯 下一步

1. ✅ 部署到 Cloudflare Pages
2. ✅ 测试路由逻辑是否正常
3. ✅ 绑定自定义域名（可选）
4. ✅ 配置分析工具（如 Google Analytics）
5. ✅ 开始投放广告！

---

## 📞 需要帮助？

如有问题，请查看：
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions 文档](https://developers.cloudflare.com/pages/functions/)

祝您部署顺利！🚀
