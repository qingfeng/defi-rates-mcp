# 提交到 MCP 官方目录的步骤

## 准备好的服务器信息

**要添加到 README.md 的内容**（放在 "Third-Party Servers" 部分，按字母顺序）：

```markdown
📊 **[DeFi Rates](https://github.com/qingfeng/defi-rates-mcp)** - Query real-time DeFi lending rates across 13+ protocols (Aave, Morpho, Compound, Venus, Solend, Drift, Jupiter, etc.). Compare rates, search best opportunities, and calculate looping strategies across Ethereum, Arbitrum, Base, BSC, Solana, and HyperEVM.
```

## 提交步骤

### 1. Fork 官方仓库

访问：https://github.com/modelcontextprotocol/servers

点击右上角的 **Fork** 按钮

### 2. 克隆你的 fork

```bash
git clone https://github.com/qingfeng/servers.git
cd servers
```

### 3. 创建新分支

```bash
git checkout -b add-defi-rates-mcp
```

### 4. 编辑 README.md

找到 "Third-Party Servers" 部分，按字母顺序添加我们的服务器（D 开头，应该在前面）：

```markdown
📊 **[DeFi Rates](https://github.com/qingfeng/defi-rates-mcp)** - Query real-time DeFi lending rates across 13+ protocols (Aave, Morpho, Compound, Venus, Solend, Drift, Jupiter, etc.). Compare rates, search best opportunities, and calculate looping strategies across Ethereum, Arbitrum, Base, BSC, Solana, and HyperEVM.
```

### 5. 提交更改

```bash
git add README.md
git commit -m "Add DeFi Rates MCP server to third-party list"
git push origin add-defi-rates-mcp
```

### 6. 创建 Pull Request

1. 访问：https://github.com/qingfeng/servers
2. 点击 **"Compare & pull request"** 按钮
3. 填写 PR 信息：

**标题**：
```
Add DeFi Rates MCP server
```

**描述**：
```
# Add DeFi Rates MCP Server

## Description
Adding DeFi Rates MCP server to the third-party servers list.

## What it does
- Provides real-time access to DeFi lending rates across 13+ major protocols
- Supports queries for borrow/supply rates, platform comparison, and looping strategy calculations
- Covers multiple chains: Ethereum, Arbitrum, Base, BSC, Solana, HyperEVM

## Links
- GitHub: https://github.com/qingfeng/defi-rates-mcp
- npm: https://www.npmjs.com/package/@asahi001/defi-rates-mcp
- Website: https://defiborrow.loan

## Installation
\```bash
npm install -g @asahi001/defi-rates-mcp
\```

This server is already published to npm and ready for use with Claude Desktop and other MCP clients.
```

4. 点击 **"Create pull request"**

### 7. 等待审核

MCP 团队会审核你的 PR。如果有任何修改建议，他们会在 PR 中评论。

## 注意事项

- ✅ 确保按字母顺序添加
- ✅ 保持简洁的描述（1-2句话）
- ✅ 使用 emoji 图标（📊）增加可识别性
- ✅ 链接到 GitHub 仓库

## 完成后

PR 合并后，你的 MCP 服务器就会出现在官方列表中，更多开发者能发现和使用它！

---

需要帮助？随时问我！
