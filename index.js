#!/usr/bin/env node

/**
 * DeFi Lending Pro - MCP Server
 * Provides AI access to real-time DeFi lending data
 *
 * This is a stdio-based MCP server that wraps the remote HTTP endpoint.
 * For direct HTTP access, use: https://defiborrow.loan/mcp
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_URL = 'https://defiborrow.loan';

// Create MCP server instance
const server = new Server(
  {
    name: 'defi-lending-pro',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// === Helper Functions ===

function formatPercent(value) {
  if (typeof value === 'number') {
    return `${value.toFixed(2)}%`;
  }
  return value;
}

function parsePercent(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace('%', '').replace(/,/g, '').trim();
    if (normalized === '') return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

// Fetch lending events from API
async function fetchLendingEvents(params = {}) {
  try {
    const response = await axios.get(`${API_URL}/api/lending-events`, {
      params: {
        limit: params.limit || 20,
        chain: params.chain,
        protocol: params.protocol,
        event_type: params.event_type,
        min_amount_usd: params.min_amount_usd,
      },
      timeout: 30000
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch lending events');
    }

    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
}

// Fetch lending rates from API
async function fetchLendingRates(filters = {}) {
  try {
    const response = await axios.get(`${API_URL}/api/platforms`, {
      timeout: 30000
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch rates data');
    }

    let data = response.data.data;

    // Apply filters
    if (filters.platform) {
      data = data.filter(r => r.platform.toLowerCase() === filters.platform.toLowerCase());
    }
    if (filters.chain) {
      data = data.filter(r => r.chain.toLowerCase() === filters.chain.toLowerCase());
    }
    if (filters.asset) {
      data = data.filter(r => r.asset.toLowerCase() === filters.asset.toLowerCase());
    }
    if (filters.collateral) {
      data = data.filter(r => r.collateral.toLowerCase() === filters.collateral.toLowerCase());
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to fetch rates: ${error.message}`);
  }
}

// Fetch earn markets from API
async function fetchEarnMarkets(filters = {}) {
  try {
    const response = await axios.get(`${API_URL}/api/earn-markets`, {
      timeout: 30000
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch earn markets data');
    }

    let data = response.data.data;

    // Apply filters
    if (filters.platform) {
      data = data.filter(r => r.platform.toLowerCase() === filters.platform.toLowerCase());
    }
    if (filters.chain) {
      data = data.filter(r => r.chain.toLowerCase() === filters.chain.toLowerCase());
    }
    if (filters.asset) {
      data = data.filter(r => r.asset.toLowerCase() === filters.asset.toLowerCase());
    }
    if (filters.min_apy) {
      data = data.filter(r => {
        const apy = parsePercent(r.rates?.supplyApy);
        return apy !== null && apy >= filters.min_apy;
      });
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to fetch earn markets: ${error.message}`);
  }
}

// Format event for output
function formatEvent(event) {
  return {
    type: event.event_type,
    protocol: event.protocol,
    chain: event.chain,
    user: event.user_address ? `${event.user_address.slice(0, 6)}...${event.user_address.slice(-4)}` : null,
    asset: event.asset,
    amount: event.amount,
    amount_usd: event.amount_usd ? `$${Number(event.amount_usd).toLocaleString()}` : null,
    tx_hash: event.tx_hash,
    timestamp: event.timestamp,
  };
}

// Format lending market for output
function formatLendingMarket(market) {
  return {
    platform: market.platform,
    chain: market.chain,
    asset: market.asset,
    collateral: market.collateral,
    borrow_apy: market.rates?.borrowApy || 'N/A',
    supply_apy: market.rates?.supplyApy || 'N/A',
    liquidation_threshold: market.price?.liquidationThreshold || null,
    tvl: market.tvl || null,
    url: market.borrowUrl || null,
  };
}

// Format earn market for output
function formatEarnMarket(market) {
  return {
    platform: market.platform,
    chain: market.chain,
    asset: market.asset,
    supply_apy: market.rates?.supplyApy || 'N/A',
    tvl: market.tvl || null,
    url: market.borrowUrl || null,
  };
}

// === Tool Definitions ===

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // On-chain Event Tools
      {
        name: 'get_recent_events',
        description: 'Get recent on-chain lending events (borrows, deposits, liquidations, repays). Returns real-time blockchain activity.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of events to return (default: 20, max: 100)',
              default: 20
            },
            chain: {
              type: 'string',
              description: 'Filter by blockchain (ethereum, arbitrum, base, bsc, solana)',
            },
            protocol: {
              type: 'string',
              description: 'Filter by protocol (aave, morpho, compound, etc.)',
            }
          }
        }
      },
      {
        name: 'get_events_by_type',
        description: 'Get lending events filtered by event type',
        inputSchema: {
          type: 'object',
          properties: {
            event_type: {
              type: 'string',
              enum: ['borrow', 'deposit', 'withdraw', 'repay', 'liquidation', 'flashloan'],
              description: 'Type of lending event'
            },
            limit: {
              type: 'number',
              description: 'Number of events to return (default: 20)',
              default: 20
            },
            chain: {
              type: 'string',
              description: 'Filter by blockchain',
            }
          },
          required: ['event_type']
        }
      },
      {
        name: 'get_whale_activity',
        description: 'Get large lending events (whale activity). Returns events with amount > $100,000 USD.',
        inputSchema: {
          type: 'object',
          properties: {
            min_amount_usd: {
              type: 'number',
              description: 'Minimum amount in USD (default: 100000)',
              default: 100000
            },
            limit: {
              type: 'number',
              description: 'Number of events to return (default: 20)',
              default: 20
            },
            chain: {
              type: 'string',
              description: 'Filter by blockchain',
            },
            event_type: {
              type: 'string',
              description: 'Filter by event type',
            }
          }
        }
      },
      {
        name: 'get_liquidations',
        description: 'Get recent liquidation events across all protocols',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of events to return (default: 20)',
              default: 20
            },
            chain: {
              type: 'string',
              description: 'Filter by blockchain',
            },
            protocol: {
              type: 'string',
              description: 'Filter by protocol',
            }
          }
        }
      },

      // Lending Rate Tools
      {
        name: 'get_lending_rates',
        description: 'Get current lending/borrowing rates across DeFi protocols. Returns APY, TVL, and market data for lending markets.',
        inputSchema: {
          type: 'object',
          properties: {
            chain: {
              type: 'string',
              description: 'Filter by blockchain (ethereum, arbitrum, base, bsc, solana, hyperevm)',
            },
            platform: {
              type: 'string',
              description: 'Filter by platform (AAVE, Morpho, Compound, Venus, Spark, etc.)',
            },
            asset: {
              type: 'string',
              description: 'Filter by asset symbol (USDC, USDT, ETH, WBTC, etc.)',
            },
            collateral: {
              type: 'string',
              description: 'Filter by collateral asset',
            },
            limit: {
              type: 'number',
              description: 'Number of results (default: 50)',
              default: 50
            }
          }
        }
      },
      {
        name: 'get_earn_markets',
        description: 'Get earn/yield markets (single-asset deposits). Returns APY for deposit-only products like Spark stUSDS, Morpho Vaults.',
        inputSchema: {
          type: 'object',
          properties: {
            chain: {
              type: 'string',
              description: 'Filter by blockchain',
            },
            platform: {
              type: 'string',
              description: 'Filter by platform',
            },
            asset: {
              type: 'string',
              description: 'Filter by asset symbol',
            },
            min_apy: {
              type: 'number',
              description: 'Minimum APY percentage (e.g., 5 for 5%)',
            },
            limit: {
              type: 'number',
              description: 'Number of results (default: 50)',
              default: 50
            }
          }
        }
      },
      {
        name: 'find_best_borrow',
        description: 'Find the lowest borrowing rate for a specific asset across all platforms and chains',
        inputSchema: {
          type: 'object',
          properties: {
            asset: {
              type: 'string',
              description: 'Asset to borrow (USDC, USDT, ETH, etc.)',
            },
            chain: {
              type: 'string',
              description: 'Limit search to specific chain (optional)',
            },
            top_n: {
              type: 'number',
              description: 'Return top N results (default: 5)',
              default: 5
            }
          },
          required: ['asset']
        }
      },
      {
        name: 'find_best_yield',
        description: 'Find the highest deposit/supply yield for a specific asset across all platforms',
        inputSchema: {
          type: 'object',
          properties: {
            asset: {
              type: 'string',
              description: 'Asset to deposit (USDC, USDT, ETH, etc.)',
            },
            chain: {
              type: 'string',
              description: 'Limit search to specific chain (optional)',
            },
            include_earn_markets: {
              type: 'boolean',
              description: 'Include earn markets (vaults, staking) in search (default: true)',
              default: true
            },
            top_n: {
              type: 'number',
              description: 'Return top N results (default: 5)',
              default: 5
            }
          },
          required: ['asset']
        }
      }
    ],
  };
});

// === Tool Call Handler ===

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_recent_events': {
        const events = await fetchLendingEvents({
          limit: Math.min(args.limit || 20, 100),
          chain: args.chain,
          protocol: args.protocol,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: events.length,
              events: events.map(formatEvent)
            }, null, 2)
          }]
        };
      }

      case 'get_events_by_type': {
        const events = await fetchLendingEvents({
          event_type: args.event_type,
          limit: Math.min(args.limit || 20, 100),
          chain: args.chain,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              event_type: args.event_type,
              count: events.length,
              events: events.map(formatEvent)
            }, null, 2)
          }]
        };
      }

      case 'get_whale_activity': {
        const events = await fetchLendingEvents({
          min_amount_usd: args.min_amount_usd || 100000,
          limit: Math.min(args.limit || 20, 100),
          chain: args.chain,
          event_type: args.event_type,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              min_amount_usd: args.min_amount_usd || 100000,
              count: events.length,
              events: events.map(formatEvent)
            }, null, 2)
          }]
        };
      }

      case 'get_liquidations': {
        const events = await fetchLendingEvents({
          event_type: 'liquidation',
          limit: Math.min(args.limit || 20, 100),
          chain: args.chain,
          protocol: args.protocol,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: events.length,
              liquidations: events.map(formatEvent)
            }, null, 2)
          }]
        };
      }

      case 'get_lending_rates': {
        let data = await fetchLendingRates({
          chain: args.chain,
          platform: args.platform,
          asset: args.asset,
          collateral: args.collateral,
        });

        // Sort by borrow APY (lowest first)
        data.sort((a, b) => {
          const aRate = parsePercent(a.rates?.borrowApy) || 999;
          const bRate = parsePercent(b.rates?.borrowApy) || 999;
          return aRate - bRate;
        });

        const limit = Math.min(args.limit || 50, 200);
        const results = data.slice(0, limit);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: results.length,
              markets: results.map(formatLendingMarket)
            }, null, 2)
          }]
        };
      }

      case 'get_earn_markets': {
        let data = await fetchEarnMarkets({
          chain: args.chain,
          platform: args.platform,
          asset: args.asset,
          min_apy: args.min_apy,
        });

        // Sort by supply APY (highest first)
        data.sort((a, b) => {
          const aRate = parsePercent(a.rates?.supplyApy) || 0;
          const bRate = parsePercent(b.rates?.supplyApy) || 0;
          return bRate - aRate;
        });

        const limit = Math.min(args.limit || 50, 200);
        const results = data.slice(0, limit);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: results.length,
              markets: results.map(formatEarnMarket)
            }, null, 2)
          }]
        };
      }

      case 'find_best_borrow': {
        let data = await fetchLendingRates({
          asset: args.asset,
          chain: args.chain,
        });

        // Filter out zero rates and sort by borrow APY
        data = data.filter(r => {
          const rate = parsePercent(r.rates?.borrowApy);
          return rate !== null && rate > 0;
        });

        data.sort((a, b) => {
          const aRate = parsePercent(a.rates?.borrowApy);
          const bRate = parsePercent(b.rates?.borrowApy);
          return aRate - bRate;
        });

        const topN = args.top_n || 5;
        const results = data.slice(0, topN);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              asset: args.asset,
              search_chain: args.chain || 'all',
              best_rates: results.map((r, i) => ({
                rank: i + 1,
                ...formatLendingMarket(r)
              }))
            }, null, 2)
          }]
        };
      }

      case 'find_best_yield': {
        const results = [];
        const includeEarn = args.include_earn_markets !== false;

        // Search lending markets (collateral yield)
        const lendingData = await fetchLendingRates({
          collateral: args.asset,
          chain: args.chain,
        });

        lendingData.forEach(r => {
          const apy = parsePercent(r.rates?.supplyApy);
          if (apy !== null && apy > 0) {
            results.push({
              ...r,
              market_type: 'lending',
              _apy: apy
            });
          }
        });

        // Search earn markets
        if (includeEarn) {
          const earnData = await fetchEarnMarkets({
            asset: args.asset,
            chain: args.chain,
          });

          earnData.forEach(r => {
            const apy = parsePercent(r.rates?.supplyApy);
            if (apy !== null && apy > 0) {
              results.push({
                ...r,
                market_type: 'earn',
                _apy: apy
              });
            }
          });
        }

        // Sort by APY (highest first)
        results.sort((a, b) => b._apy - a._apy);

        const topN = args.top_n || 5;
        const topResults = results.slice(0, topN);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              asset: args.asset,
              search_chain: args.chain || 'all',
              include_earn_markets: includeEarn,
              best_yields: topResults.map((r, i) => ({
                rank: i + 1,
                platform: r.platform,
                chain: r.chain,
                market_type: r.market_type,
                supply_apy: formatPercent(r._apy),
                url: r.borrowUrl
              }))
            }, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`,
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DeFi Lending Pro MCP Server running on stdio');
  console.error('Remote endpoint: https://defiborrow.loan/mcp');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
