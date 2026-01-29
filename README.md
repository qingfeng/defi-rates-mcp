# DeFi Lending Pro - Remote MCP Server

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ERC-8004](https://img.shields.io/badge/ERC--8004-Agent%20%23283-blue)](https://8004.org)

**Remote MCP server providing real-time DeFi lending data for AI agents.**

Give Claude and other AI assistants the power to query DeFi rates, monitor whale activity, and track on-chain lending events in real-time!

## Remote Endpoint

```
https://defiborrow.loan/mcp
```

**No installation required** - just configure your MCP client to use the HTTP endpoint.

## Features

- **14+ Protocols**: Aave, Morpho, Compound, Venus, Lista, Spark, Felix, Euler, Drift, Jupiter, HypurrFi & more
- **Real-time Data**: Updated hourly from production DeFi protocols
- **8 Powerful Tools**: Query rates, track whales, monitor liquidations, find best yields
- **Multi-Chain**: Ethereum, Arbitrum, Base, BSC, Solana, HyperEVM
- **On-chain Events**: Real-time lending event monitoring (borrows, deposits, liquidations)
- **Usage Stats**: Built-in analytics at `/mcp/stats`

## Available Tools

### On-chain Event Tools

#### 1. `get_recent_events`
Get recent on-chain lending events (borrows, deposits, liquidations, repays).

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Number of events (default: 20, max: 100) |
| `chain` | string | Filter by blockchain |
| `protocol` | string | Filter by protocol |

#### 2. `get_events_by_type`
Get lending events filtered by event type.

| Parameter | Type | Description |
|-----------|------|-------------|
| `event_type` | string | **Required**. One of: `borrow`, `deposit`, `withdraw`, `repay`, `liquidation`, `flashloan` |
| `limit` | number | Number of events (default: 20) |
| `chain` | string | Filter by blockchain |

#### 3. `get_whale_activity`
Get large lending events (whale activity >$100K USD).

| Parameter | Type | Description |
|-----------|------|-------------|
| `min_amount_usd` | number | Minimum USD amount (default: 100000) |
| `limit` | number | Number of events (default: 20) |
| `chain` | string | Filter by blockchain |
| `event_type` | string | Filter by event type |

#### 4. `get_liquidations`
Get recent liquidation events across all protocols.

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Number of events (default: 20) |
| `chain` | string | Filter by blockchain |
| `protocol` | string | Filter by protocol |

### Lending Rate Tools

#### 5. `get_lending_rates`
Get current lending/borrowing rates across DeFi protocols.

| Parameter | Type | Description |
|-----------|------|-------------|
| `chain` | string | Filter by blockchain |
| `platform` | string | Filter by platform (AAVE, Morpho, Compound, etc.) |
| `asset` | string | Filter by borrow asset (USDC, USDT, ETH, etc.) |
| `collateral` | string | Filter by collateral asset |
| `limit` | number | Number of results (default: 50) |

#### 6. `get_earn_markets`
Get earn/yield markets (single-asset deposits like Spark stUSDS, Morpho Vaults).

| Parameter | Type | Description |
|-----------|------|-------------|
| `chain` | string | Filter by blockchain |
| `platform` | string | Filter by platform |
| `asset` | string | Filter by deposit asset |
| `min_apy` | number | Minimum APY percentage |
| `limit` | number | Number of results (default: 50) |

#### 7. `find_best_borrow`
Find the lowest borrowing rate for a specific asset across all platforms.

| Parameter | Type | Description |
|-----------|------|-------------|
| `asset` | string | **Required**. Asset to borrow (USDC, USDT, ETH, etc.) |
| `chain` | string | Limit search to specific chain |
| `top_n` | number | Return top N results (default: 5) |

#### 8. `find_best_yield`
Find the highest deposit/supply yield for a specific asset.

| Parameter | Type | Description |
|-----------|------|-------------|
| `asset` | string | **Required**. Asset to deposit |
| `chain` | string | Limit search to specific chain |
| `include_earn_markets` | boolean | Include vaults/staking (default: true) |
| `top_n` | number | Return top N results (default: 5) |

## Quick Start

### Claude Code

Run this command to add the remote MCP server:

```bash
claude mcp add --transport http defi-lending-pro https://defiborrow.loan/mcp
```

Verify configuration:

```bash
claude mcp list
```

### Claude Desktop

Edit your config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "defi-lending-pro": {
      "type": "url",
      "url": "https://defiborrow.loan/mcp"
    }
  }
}
```

Save and restart Claude Desktop. Look for the plug icon to verify connection.

### Other MCP Clients

Use the HTTP transport with endpoint:

```
POST https://defiborrow.loan/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

## Usage Examples

After setup, try asking:

### Query Lending Rates
- "What's the lowest USDC borrow rate right now?"
- "Show me ETH lending rates on Ethereum"
- "Compare USDC/WETH rates between Aave and Morpho"

### Find Best Yields
- "Where can I get the best yield on USDC?"
- "What's the APY for Spark stUSDS?"
- "Find the top 5 highest yield stablecoin products"

### Monitor Whale Activity
- "Any recent whale lending activity?"
- "Show me large borrows over $500K"
- "What are the latest liquidations on Ethereum?"

### Track On-chain Events
- "Show me recent flashloans"
- "Get the latest deposit events on Aave"
- "What lending activity happened in the last hour?"

## API Reference

### MCP Protocol

The server implements [Model Context Protocol](https://modelcontextprotocol.io) (JSON-RPC 2.0 over HTTP).

**Supported Methods:**
- `initialize` - Initialize connection
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `resources/list` - List resources (empty)
- `prompts/list` - List prompts (empty)

### Usage Statistics

View usage stats at:

```
GET https://defiborrow.loan/mcp/stats?days=7
```

Returns:
- Total calls and success rate
- Calls by method and tool
- Unique clients
- Daily breakdown
- Average response time

## Data Sources

| Protocol | Chains | Type |
|----------|--------|------|
| Aave | Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, Gnosis | Lending |
| Morpho | Ethereum, Base | Lending + Vaults |
| Compound V3 | Ethereum, Arbitrum, Base, Optimism, Polygon | Lending |
| Venus | BSC | Lending |
| Lista | BSC | Lending + Earn |
| Spark | Ethereum, Gnosis | Lending + Earn (stUSDS 12%+ APY) |
| Fluid | Ethereum, Arbitrum, Base | Lending |
| HyperLend | HyperEVM | Lending |
| HypurrFi | HyperEVM | Lending |
| Euler | Ethereum, Arbitrum, Base | Lending + Vaults |
| Drift | Solana | Lending |
| Jupiter | Solana | Lending |
| Felix | Solana | Earn |

**Update Frequency**: Hourly

## ERC-8004 Agent

This service is registered as an ERC-8004 AI Agent:

- **Agent ID**: #283
- **Network**: Base Sepolia
- **Registry**: [View on BaseScan](https://sepolia.basescan.org/token/0x7177a6867296406881E20d6647232314736Dd09A?a=283)

Learn more about [ERC-8004](https://8004.org) - the AI Agent Trust Layer standard.

## Links

- **Website**: https://defiborrow.loan
- **MCP Endpoint**: https://defiborrow.loan/mcp
- **Usage Stats**: https://defiborrow.loan/mcp/stats
- **ERC-8004 Page**: https://defiborrow.loan/?type=erc8004
- **npm Package**: [@asahi001/defi-rates-mcp](https://www.npmjs.com/package/@asahi001/defi-rates-mcp)

## License

MIT
