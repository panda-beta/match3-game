# 消消乐游戏 - CloudBase 部署指南

## 方法一：使用 CloudBase CLI 部署（推荐）

### 前置准备

1. **安装 Node.js**（如果未安装）
   - 访问 https://nodejs.org/
   - 下载并安装 LTS 版本

2. **安装 CloudBase CLI**
   ```bash
   npm install -g @cloudbase/cli
   ```

3. **登录 CloudBase**
   ```bash
   tcb login
   ```
   这会打开浏览器让您扫码登录

4. **创建 CloudBase 环境**
   - 访问 https://console.cloud.tencent.com/tcb
   - 创建一个新环境（免费版即可）

5. **部署项目**
   ```bash
   cd c:/Users/admin/CodeBuddy/Claw
   tcb hosting deploy ./index.html -e 您的环境ID
   tcb hosting deploy ./game.js -e 您的环境ID
   ```

6. **访问游戏**
   部署成功后，您会获得一个访问地址，例如：
   `https://您的环境ID.service.tcloudbase.com/`

---

## 方法二：使用 CloudBase 控制台上传（无需命令行）

### 步骤说明

1. **登录腾讯云控制台**
   - 访问 https://console.cloud.tencent.com/tcb

2. **创建新环境**
   - 点击"新建环境"
   - 选择"免费版"（适合个人项目）
   - 环境名称：消消乐游戏
   - 地域：选择离您最近的

3. **开启静态网站托管**
   - 进入刚创建的环境
   - 点击左侧菜单"静态网站托管"
   - 点击"开通"（免费）

4. **上传文件**
   - 点击"文件管理"或"上传文件"
   - 将 `index.html` 和 `game.js` 两个文件上传
   - 确保 `index.html` 在根目录

5. **访问游戏**
   - 部署完成后会显示访问地址
   - 地址格式：`https://您的环境ID.service.tcloudbase.com/`

---

## 方法三：使用其他免费托管平台

### GitHub Pages（最简单）

1. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 仓库名：match3-game

2. **上传文件**
   - 点击 "uploading an existing file"
   - 上传 `index.html` 和 `game.js`

3. **启用 GitHub Pages**
   - 进入仓库的 Settings
   - 找到 "Pages" 部分
   - Source 选择 "main" 分支
   - 点击 Save

4. **访问游戏**
   - 几分钟后，访问地址：`https://您的用户名.github.io/match3-game/`

### Vercel（推荐）

1. **访问 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 导入包含代码的 GitHub 仓库

3. **自动部署**
   - Vercel 会自动检测并部署
   - 几分钟后获得访问地址

---

## 当前游戏文件位置
- `c:/Users/admin/CodeBuddy/Claw/index.html`
- `c:/Users/admin/CodeBuddy/Claw/game.js`

---

## 推荐选择

**最简单快速：GitHub Pages**
- ✅ 完全免费
- ✅ 操作简单
- ✅ 无需安装工具
- ✅ 自动提供 HTTPS

**最适合国内访问：CloudBase**
- ✅ 国内访问速度快
- ✅ 腾讯云支持
- ✅ 可扩展后端功能

您想使用哪种方式？我可以为您提供更详细的步骤指导。
