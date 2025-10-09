# 发布指南

## 方式 1：发布到 npm（推荐）

### 前提条件
1. 注册 npm 账号：https://www.npmjs.com/signup
2. 本地登录 npm

### 发布步骤

```bash
# 1. 进入项目目录
cd /Users/qingfeng/Desktop/solana_lp/defi-rates-mcp

# 2. 登录 npm（首次需要）
npm login

# 3. 发布到 npm
npm publish --access public

# 注意：如果包名不带 @scope（如 defi-rates-mcp），可以直接 npm publish
```

### 更新版本

```bash
# 更新补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 更新次版本 (1.0.0 -> 1.1.0)
npm version minor

# 更新主版本 (1.0.0 -> 2.0.0)
npm version major

# 发布新版本
npm publish
```

### 用户如何使用

发布后，其他人可以直接安装：

```bash
npm install -g @defiborrow/rates-mcp
```

在 Claude Desktop 配置中使用：

```json
{
  "mcpServers": {
    "defi-rates": {
      "command": "npx",
      "args": ["-y", "@defiborrow/rates-mcp"]
    }
  }
}
```

---

## 方式 2：发布到 GitHub

### 步骤

```bash
# 1. 初始化 git
cd /Users/qingfeng/Desktop/solana_lp/defi-rates-mcp
git init

# 2. 添加文件
git add .
git commit -m "Initial commit: DeFi Rates MCP Server"

# 3. 在 GitHub 创建仓库（通过网页）
# https://github.com/new

# 4. 关联远程仓库（替换你的用户名）
git remote add origin https://github.com/yourusername/defi-rates-mcp.git

# 5. 推送代码
git branch -M main
git push -u origin main
```

### 用户如何使用

其他人可以克隆使用：

```bash
git clone https://github.com/yourusername/defi-rates-mcp.git
cd defi-rates-mcp
npm install
```

在 Claude Desktop 配置中使用：

```json
{
  "mcpServers": {
    "defi-rates": {
      "command": "node",
      "args": ["/path/to/defi-rates-mcp/index.js"]
    }
  }
}
```

---

## 方式 3：添加到 MCP 服务器目录

提交 PR 到官方 MCP 服务器列表：
https://github.com/modelcontextprotocol/servers

这样你的 MCP 服务器会出现在官方目录中，更容易被发现。

### 提交步骤

1. Fork https://github.com/modelcontextprotocol/servers
2. 在 `src/servers.json` 中添加你的服务器信息：

```json
{
  "name": "@defiborrow/rates-mcp",
  "description": "Real-time DeFi lending rates across 13+ protocols",
  "author": "DefiBorrow",
  "sourceUrl": "https://github.com/yourusername/defi-rates-mcp",
  "installCommand": "npx -y @defiborrow/rates-mcp"
}
```

3. 提交 Pull Request

---

## 推荐的发布顺序

1. ✅ **先发布到 npm** - 最方便用户安装
2. ✅ **同时发布到 GitHub** - 开源 + 获得 stars
3. ✅ **提交到 MCP 官方目录** - 增加曝光度

---

## 注意事项

### npm 包名规则

- 带 scope 的包（如 `@defiborrow/rates-mcp`）需要 `--access public`
- 不带 scope 的包（如 `defi-rates-mcp`）直接 `npm publish`

### 版本号语义

- **1.0.0**: 首次发布
- **1.0.x**: Bug 修复
- **1.x.0**: 新功能（向后兼容）
- **x.0.0**: 重大更新（可能不兼容）

### 发布前检查清单

- [ ] 测试所有 tools 功能正常
- [ ] 更新 README.md
- [ ] 更新版本号
- [ ] 添加 CHANGELOG.md（可选）
- [ ] 确保 .gitignore 正确
- [ ] 检查 package.json 中的 files 字段

---

## 宣传推广

发布后可以在以下地方宣传：

1. **Twitter/X** - 发推介绍你的 MCP 服务器
2. **Reddit** - r/ClaudeAI, r/DeFi
3. **Discord** - Anthropic Discord 社区
4. **Product Hunt** - 如果功能完善
5. **你的网站** - https://defiborrow.loan 添加说明

---

需要帮助？随时问我！
