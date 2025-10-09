#!/usr/bin/env node

/**
 * DeFi Rates MCP Server
 * Provides AI access to DeFi lending rates data
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const WORKER_URL = 'https://defi-rates.qingfenghello.workers.dev';

// 创建 MCP 服务器实例
const server = new Server(
  {
    name: 'defi-rates-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 辅助函数：格式化百分比
function formatPercent(value) {
  if (typeof value === 'string') {
    return value;
  }
  return `${(value * 100).toFixed(2)}%`;
}

// 辅助函数：获取最新利率数据
async function fetchLatestRates(filters = {}) {
  try {
    const response = await axios.get(`${WORKER_URL}/api/platforms`, {
      timeout: 30000
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch rates data');
    }

    let data = response.data.data;

    // 应用筛选
    if (filters.platform) {
      data = data.filter(r => r.platform.toLowerCase() === filters.platform.toLowerCase());
    }
    if (filters.chain) {
      data = data.filter(r => r.chain.toLowerCase() === filters.chain.toLowerCase());
    }
    if (filters.asset) {
      data = data.filter(r => r.asset.toLowerCase().includes(filters.asset.toLowerCase()));
    }
    if (filters.collateral) {
      data = data.filter(r => r.collateral.toLowerCase().includes(filters.collateral.toLowerCase()));
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to fetch rates: ${error.message}`);
  }
}

// 辅助函数：获取 DBI 指数
async function fetchDBI() {
  try {
    const response = await axios.get(`${WORKER_URL}/api/dbi`, {
      params: { action: 'latest' },
      timeout: 30000
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch DBI data');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fetch DBI: ${error.message}`);
  }
}

// 辅助函数：计算循环贷策略
function calculateLooping(params) {
  const { collateralAmount, collateralPrice, borrowApy, supplyApy, ltv, liquidationThreshold } = params;

  const initialValue = collateralAmount * collateralPrice;
  let totalCollateral = collateralAmount;
  let totalBorrowed = 0;
  let rounds = [];

  // 模拟循环借贷过程（最多10轮）
  for (let i = 0; i < 10; i++) {
    const currentValue = totalCollateral * collateralPrice;
    const borrowAmount = currentValue * (ltv / 100);

    if (borrowAmount < 1) break; // 借贷金额太小，停止

    totalBorrowed += borrowAmount;
    const newCollateral = borrowAmount / collateralPrice;
    totalCollateral += newCollateral;

    rounds.push({
      round: i + 1,
      borrowed: borrowAmount,
      newCollateral: newCollateral,
      totalCollateral: totalCollateral,
      totalBorrowed: totalBorrowed,
      currentLTV: (totalBorrowed / (totalCollateral * collateralPrice)) * 100
    });
  }

  const leverage = totalCollateral / collateralAmount;
  const totalPosition = totalCollateral * collateralPrice;
  const liquidationPrice = (totalBorrowed / liquidationThreshold) / totalCollateral;
  const maxDrop = ((collateralPrice - liquidationPrice) / collateralPrice) * 100;
  const annualInterest = totalBorrowed * (borrowApy / 100);

  return {
    leverage: leverage.toFixed(2),
    totalBorrowed: totalBorrowed.toFixed(2),
    totalPosition: totalPosition.toFixed(2),
    liquidationPrice: liquidationPrice.toFixed(2),
    maxDropPercent: maxDrop.toFixed(2),
    annualInterest: annualInterest.toFixed(2),
    rounds: rounds
  };
}

// 定义可用的 tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_latest_rates',
        description: 'Get the latest DeFi lending rates. You can filter by platform, chain, asset, or collateral.',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              description: 'Filter by platform (e.g., Aave, Morpho, Compound, Venus, Lista, Moonwell, HyperLend, Fluid, Euler, Drift, Solend, Jupiter)',
            },
            chain: {
              type: 'string',
              description: 'Filter by blockchain (e.g., ethereum, arbitrum, base, bsc, solana, hyperevm)',
            },
            asset: {
              type: 'string',
              description: 'Filter by borrow asset (e.g., USDC, USDT, WETH, WBTC)',
            },
            collateral: {
              type: 'string',
              description: 'Filter by collateral asset (e.g., ETH, WETH, WBTC, SOL)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 20)',
              default: 20
            }
          },
        },
      },
      {
        name: 'get_dbi_index',
        description: 'Get the DBI (DeFi Borrow Index) - a weighted average of stablecoin borrow rates across major protocols.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'search_best_rates',
        description: 'Find the best borrow or supply rates for a specific asset.',
        inputSchema: {
          type: 'object',
          properties: {
            asset: {
              type: 'string',
              description: 'The asset to search for (e.g., USDC, USDT, WETH)',
            },
            type: {
              type: 'string',
              enum: ['borrow', 'supply'],
              description: 'Whether to search for best borrow rates (lowest) or supply rates (highest)',
            },
            chain: {
              type: 'string',
              description: 'Optional: filter by blockchain',
            },
            limit: {
              type: 'number',
              description: 'Number of results to return (default: 10)',
              default: 10
            }
          },
          required: ['asset', 'type'],
        },
      },
      {
        name: 'calculate_looping_strategy',
        description: 'Calculate the leverage looping strategy metrics including leverage multiplier, liquidation price, and interest costs.',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              description: 'The lending platform to use',
            },
            asset: {
              type: 'string',
              description: 'The asset to borrow',
            },
            collateral: {
              type: 'string',
              description: 'The collateral asset',
            },
            collateralAmount: {
              type: 'number',
              description: 'Amount of collateral tokens',
            },
            collateralPrice: {
              type: 'number',
              description: 'Current price of collateral in USD',
            },
            ltv: {
              type: 'number',
              description: 'Target LTV ratio (percentage, e.g., 75 for 75%)',
            }
          },
          required: ['platform', 'asset', 'collateral', 'collateralAmount', 'collateralPrice', 'ltv'],
        },
      },
      {
        name: 'compare_platforms',
        description: 'Compare borrow/supply rates across different platforms for the same asset pair.',
        inputSchema: {
          type: 'object',
          properties: {
            asset: {
              type: 'string',
              description: 'The borrow asset',
            },
            collateral: {
              type: 'string',
              description: 'The collateral asset',
            },
            chain: {
              type: 'string',
              description: 'Optional: filter by blockchain',
            }
          },
          required: ['asset', 'collateral'],
        },
      },
    ],
  };
});

// 处理 tool 调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_latest_rates': {
        const filters = {
          platform: args.platform,
          chain: args.chain,
          asset: args.asset,
          collateral: args.collateral,
        };

        const data = await fetchLatestRates(filters);
        const limit = args.limit || 20;
        const results = data.slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'get_dbi_index': {
        const dbi = await fetchDBI();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(dbi, null, 2),
            },
          ],
        };
      }

      case 'search_best_rates': {
        const { asset, type, chain, limit = 10 } = args;

        const filters = { asset };
        if (chain) filters.chain = chain;

        const data = await fetchLatestRates(filters);

        // 排序
        const sorted = data.sort((a, b) => {
          const aRate = parseFloat(a.rates[type === 'borrow' ? 'borrowApy' : 'supplyApy'].replace('%', ''));
          const bRate = parseFloat(b.rates[type === 'borrow' ? 'borrowApy' : 'supplyApy'].replace('%', ''));

          // 借贷利率：从低到高，存款利率：从高到低
          return type === 'borrow' ? aRate - bRate : bRate - aRate;
        });

        const results = sorted.slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'calculate_looping_strategy': {
        const { platform, asset, collateral, collateralAmount, collateralPrice, ltv } = args;

        // 获取该平台的利率数据
        const data = await fetchLatestRates({ platform, asset, collateral });

        if (data.length === 0) {
          throw new Error(`No data found for ${platform} ${asset}/${collateral}`);
        }

        const market = data[0];
        const borrowApy = parseFloat(market.rates.borrowApy.replace('%', ''));
        const supplyApy = parseFloat(market.rates.supplyApy.replace('%', ''));
        const liquidationThreshold = parseFloat(market.price.liquidationThreshold.replace('%', '')) / 100;

        const result = calculateLooping({
          collateralAmount,
          collateralPrice,
          borrowApy,
          supplyApy,
          ltv,
          liquidationThreshold
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                market: {
                  platform: market.platform,
                  asset: market.asset,
                  collateral: market.collateral,
                  borrowApy: market.rates.borrowApy,
                  supplyApy: market.rates.supplyApy,
                  liquidationThreshold: market.price.liquidationThreshold,
                },
                calculation: result
              }, null, 2),
            },
          ],
        };
      }

      case 'compare_platforms': {
        const { asset, collateral, chain } = args;

        const filters = { asset, collateral };
        if (chain) filters.chain = chain;

        const data = await fetchLatestRates(filters);

        // 按借贷利率排序
        const sorted = data.sort((a, b) => {
          const aRate = parseFloat(a.rates.borrowApy.replace('%', ''));
          const bRate = parseFloat(b.rates.borrowApy.replace('%', ''));
          return aRate - bRate;
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sorted, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DeFi Rates MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
