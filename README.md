# DeFi Rates MCP Server

[![npm version](https://img.shields.io/npm/v/@asahi001/defi-rates-mcp)](https://www.npmjs.com/package/@asahi001/defi-rates-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/qingfeng/defi-rates-mcp)](https://github.com/qingfeng/defi-rates-mcp/stargazers)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

Model Context Protocol (MCP) server that provides AI assistants with access to real-time DeFi lending rates data.

**🎯 Give Claude and other AI assistants the power to query DeFi rates in real-time!**

## ✨ Highlights

- 📊 **13+ Protocols**: Aave, Morpho, Compound, Venus, Lista, Moonwell, Euler, Drift, Solend, Jupiter & more
- ⚡ **Real-time Data**: Updated hourly from production DeFi protocols
- 🔧 **5 Powerful Tools**: Query rates, compare platforms, calculate strategies
- 🤖 **AI-Ready**: Built for Claude Desktop, Cline, and other MCP clients
- 🌐 **Multi-Chain**: Ethereum, Arbitrum, Base, BSC, Solana, HyperEVM

## Features

This MCP server provides 5 powerful tools for querying and analyzing DeFi lending data:

### 1. `get_latest_rates`
Get the latest lending rates with optional filters.

**Parameters:**
- `platform` (optional): Filter by platform (Aave, Morpho, Compound, Venus, etc.)
- `chain` (optional): Filter by blockchain (ethereum, arbitrum, base, bsc, solana, etc.)
- `asset` (optional): Filter by borrow asset (USDC, USDT, WETH, etc.)
- `collateral` (optional): Filter by collateral asset
- `limit` (optional): Maximum results to return (default: 20)

### 2. `get_dbi_index`
Get the DBI (DeFi Borrow Index) - a weighted average of stablecoin borrow rates across major protocols.

**No parameters required.**

### 3. `search_best_rates`
Find the best borrow or supply rates for a specific asset.

**Parameters:**
- `asset` (required): The asset to search for
- `type` (required): 'borrow' or 'supply'
- `chain` (optional): Filter by blockchain
- `limit` (optional): Number of results (default: 10)

### 4. `calculate_looping_strategy`
Calculate leverage looping strategy metrics.

**Parameters:**
- `platform` (required): The lending platform
- `asset` (required): The asset to borrow
- `collateral` (required): The collateral asset
- `collateralAmount` (required): Amount of collateral tokens
- `collateralPrice` (required): Current price in USD
- `ltv` (required): Target LTV ratio percentage (e.g., 75)

### 5. `compare_platforms`
Compare rates across different platforms for the same asset pair.

**Parameters:**
- `asset` (required): The borrow asset
- `collateral` (required): The collateral asset
- `chain` (optional): Filter by blockchain

## 🚀 Quick Start

1. Install the package:
```bash
npm install -g @asahi001/defi-rates-mcp
```

2. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "defi-rates": {
      "command": "npx",
      "args": ["-y", "@asahi001/defi-rates-mcp"]
    }
  }
}
```

3. Restart Claude Desktop and start asking:
   - *"What are the current USDC borrow rates on Aave?"*
   - *"Find the best USDT supply rates across all platforms"*
   - *"Calculate a looping strategy with 10 ETH on Morpho"*

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g @asahi001/defi-rates-mcp
```

### Option 2: Install from source

```bash
git clone https://github.com/qingfeng/defi-rates-mcp.git
cd defi-rates-mcp
npm install
```

## Configuration

### For Claude Desktop

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### If installed from npm:

```json
{
  "mcpServers": {
    "defi-rates": {
      "command": "npx",
      "args": ["-y", "@asahi001/defi-rates-mcp"]
    }
  }
}
```

#### If installed from source:

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

### For Other MCP Clients

Use the stdio transport protocol:

```bash
node /Users/qingfeng/Desktop/solana_lp/defi-rates-mcp/index.js
```

## Usage Examples

Once configured, you can ask Claude:

### Query Latest Rates
> "What are the current USDC borrow rates on Aave?"

> "Show me all Ethereum lending rates for WETH collateral"

### Search Best Rates
> "Find the best USDT supply rates across all platforms"

> "What's the cheapest place to borrow USDC?"

### Calculate Looping Strategy
> "Calculate a looping strategy on Aave using 10 ETH as collateral (ETH price $3000) at 75% LTV to borrow USDC"

### Compare Platforms
> "Compare USDC/WETH borrow rates across all platforms"

### Get DBI Index
> "What's the current DBI stablecoin borrow cost index?"

## Data Source

This MCP server fetches data from:
- **API Endpoint**: https://defi-rates.qingfenghello.workers.dev
- **Update Frequency**: Real-time (data updated every hour)
- **Supported Platforms**:
  - Aave (Ethereum, Arbitrum, Base)
  - Morpho (Ethereum)
  - Compound (Ethereum)
  - Venus (BSC)
  - Lista (BSC)
  - Moonwell (Base)
  - HyperLend (HyperEVM)
  - Fluid (Ethereum)
  - HypurrFi (Hyperliquid)
  - Euler (Ethereum, Arbitrum)
  - Drift (Solana)
  - Solend (Solana)
  - Jupiter (Solana)

## Development

### Test the MCP Server

```bash
# Install dependencies
npm install

# Run the server
npm start
```

### Debug Mode

The server logs to stderr, so you can see debug messages while it runs.

## Troubleshooting

### Claude Desktop Not Detecting Server

1. Check the config file path is correct
2. Restart Claude Desktop completely
3. Check the logs in Claude Desktop's developer console

### Connection Errors

- Ensure the Worker URL is accessible: https://defi-rates.qingfenghello.workers.dev
- Check your internet connection
- Verify Node.js version (requires Node 18+)

## License

MIT
