# DeFi Rates MCP Server

[![npm version](https://img.shields.io/npm/v/@asahi001/defi-rates-mcp)](https://www.npmjs.com/package/@asahi001/defi-rates-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/qingfeng/defi-rates-mcp)](https://github.com/qingfeng/defi-rates-mcp/stargazers)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

Model Context Protocol (MCP) server that provides AI assistants with access to real-time DeFi lending rates data.

**🎯 Give Claude and other AI assistants the power to query DeFi rates in real-time!**

🌐 **Website**: [defiborrow.loan](https://defiborrow.loan/)

## ✨ Highlights

- 📊 **14+ Protocols**: Aave, Morpho, Compound, Venus, Lista, Spark, Felix, Euler, Drift, Jupiter, HypurrFi & more
- ⚡ **Real-time Data**: Updated hourly from production DeFi protocols
- 🔧 **6 Powerful Tools**: Query lending rates, earn markets, compare platforms, calculate strategies
- 🤖 **AI-Ready**: Built for Claude Desktop, Cline, and other MCP clients
- 🌐 **Multi-Chain**: Ethereum, Arbitrum, Base, BSC, Solana, HyperEVM
- 💰 **Earn Markets**: Access Morpho Vaults, Spark stUSDS (12%+ APY), and other single-asset yield products

## Features

This MCP server provides 6 powerful tools for querying and analyzing DeFi lending data:

### 1. `get_latest_rates`
Get the latest lending rates for collateralized borrowing markets.

**Parameters:**
- `platform` (optional): Filter by platform (Aave, Morpho, Compound, Venus, Lista, HyperLend, Fluid, HypurrFi, Euler, Drift, Jupiter)
- `chain` (optional): Filter by blockchain (ethereum, arbitrum, base, bsc, solana, hyperevm)
- `asset` (optional): Filter by borrow asset (USDC, USDT, WETH, etc.)
- `collateral` (optional): Filter by collateral asset
- `limit` (optional): Maximum results to return (default: 10)
- `sort` (optional): Sort results by rate — `borrow_lowest`, `borrow_highest`, `supply_highest`, or `supply_lowest`

### 2. `get_earn_markets`
Get single-asset earn/vault products (no collateral required). Perfect for finding the best passive yield opportunities.

**Parameters:**
- `platform` (optional): Filter by platform (Morpho, Spark, Compound, AAVE, Lista, Felix, Euler)
- `chain` (optional): Filter by blockchain (ethereum, arbitrum, base, bsc, solana)
- `asset` (optional): Filter by deposit asset (USDC, USDT, stUSDS, sUSDS, WETH, SOL)
- `limit` (optional): Maximum results to return (default: 10)
- `sort` (optional): Sort by APY — `supply_highest` or `supply_lowest`

**Examples:**
- Find best stablecoin yields: `asset: "USDC", sort: "supply_highest"`
- Check Spark stUSDS APY: `platform: "Spark", asset: "stUSDS"`
- Best Morpho Vaults: `platform: "Morpho", sort: "supply_highest"`

### 3. `get_dbi_index`
Get the DBI (DeFi Borrow Index) - a weighted average of stablecoin borrow rates across major protocols.

**No parameters required.**

### 4. `search_best_rates`
Find the best borrow or supply rates for a specific asset.

**Parameters:**
- `asset` (required): The asset to search for
- `type` (required): 'borrow' or 'supply'
- `chain` (optional): Filter by blockchain
- `limit` (optional): Number of results (default: 10)

### 5. `calculate_looping_strategy`
Calculate leverage looping strategy metrics.

**Parameters:**
- `platform` (required): The lending platform
- `asset` (required): The asset to borrow
- `collateral` (required): The collateral asset
- `collateralAmount` (required): Amount of collateral tokens
- `collateralPrice` (required): Current price in USD
- `ltv` (required): Target LTV ratio percentage (e.g., 75)

### 6. `compare_platforms`
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

### Query Lending Rates
> "What are the current USDC borrow rates on Aave?"

> "Show me all Ethereum lending rates for WETH collateral"

> "Find the cheapest place to borrow USDC right now"

### Query Earn Markets
> "What's the APY for Spark stUSDS?"

> "Find the best USDC earn vaults across all platforms"

> "Show me Morpho vault yields on Ethereum"

> "What are the top 5 highest yield single-asset deposit products?"

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
- **Website**: https://defiborrow.loan
- **API Endpoint**: https://defiborrow.loan/api
- **Update Frequency**: Real-time (data updated every hour)
- **Supported Platforms**:
  - **Lending Markets** (collateralized borrowing):
    - Aave (Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, Gnosis)
    - Morpho (Ethereum, Base)
    - Compound V3 (Ethereum, Arbitrum, Base, Optimism, Polygon)
    - Venus (BSC)
    - Lista (BSC)
    - HyperLend (HyperEVM)
    - Fluid (Ethereum, Arbitrum, Base)
    - HypurrFi (HyperEVM)
    - Euler (Ethereum, Arbitrum, Base)
    - Drift (Solana)
    - Jupiter (Solana)
  - **Earn Markets** (single-asset vaults):
    - Morpho Vaults (Ethereum, Base, Arbitrum)
    - Spark sUSDS/stUSDS (Ethereum - 12%+ APY)
    - Compound cTokens (Multi-chain)
    - AAVE aTokens (Multi-chain)
    - Lista Earn Vaults (BSC)
    - Felix (Solana)
    - Euler Vaults (Multi-chain)

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
