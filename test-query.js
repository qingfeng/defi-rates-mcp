#!/usr/bin/env node

/**
 * 测试查询：质押 SOL，借 USDC
 */

import { spawn } from 'child_process';

const server = spawn('node', ['index.js']);

let buffer = '';
let requestId = 0;

server.stdout.on('data', (data) => {
  buffer += data.toString();

  // 尝试解析 JSON-RPC 响应
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // 保留未完成的行

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const response = JSON.parse(line);
      handleResponse(response);
    } catch (e) {
      // 不是 JSON，忽略
    }
  }
});

server.stderr.on('data', (data) => {
  // 忽略 stderr 输出（服务器日志）
});

function sendRequest(method, params = {}) {
  requestId++;
  const request = {
    jsonrpc: '2.0',
    id: requestId,
    method,
    params
  };

  server.stdin.write(JSON.stringify(request) + '\n');
  return requestId;
}

function handleResponse(response) {
  if (response.id === 1) {
    // Initialize 响应
    console.log('✅ MCP 服务器已连接\n');

    // 发送查询请求
    console.log('🔍 查询：质押 SOL 借 USDC 的平台和利率...\n');
    sendRequest('tools/call', {
      name: 'get_latest_rates',
      arguments: {
        collateral: 'SOL',
        asset: 'USDC',
        limit: 50
      }
    });

  } else if (response.id === 2) {
    // 查询结果
    if (response.result && response.result.content) {
      const data = JSON.parse(response.result.content[0].text);

      console.log('📊 查询结果：\n');
      console.log('='.repeat(80));

      if (data.length === 0) {
        console.log('❌ 未找到 SOL 质押借 USDC 的市场');
      } else {
        console.log(`找到 ${data.length} 个平台支持 SOL 质押借 USDC:\n`);

        // 按借贷利率排序
        const sorted = data.sort((a, b) => {
          const aRate = parseFloat(a.rates.borrowApy.replace('%', ''));
          const bRate = parseFloat(b.rates.borrowApy.replace('%', ''));
          return aRate - bRate;
        });

        sorted.forEach((item, index) => {
          console.log(`${index + 1}. ${item.platform} (${item.chain})`);
          console.log(`   借贷对: ${item.asset}/${item.collateral}`);
          console.log(`   💰 借贷利率: ${item.rates.borrowApy}`);
          console.log(`   💵 存款利率: ${item.rates.supplyApy}`);
          console.log(`   🔒 清算阈值: ${item.price.liquidationThreshold}`);
          console.log(`   🔗 链接: ${item.urls.borrow}`);
          console.log('');
        });

        console.log('='.repeat(80));
        console.log(`\n✨ 最佳借贷利率: ${sorted[0].platform} - ${sorted[0].rates.borrowApy}`);
      }
    }

    // 测试完成，延迟退出确保输出完成
    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 100);
  }
}

// 启动测试
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });
}, 500);

// 超时保护
setTimeout(() => {
  console.error('\n⏱️ 测试超时');
  server.kill();
  process.exit(1);
}, 30000);
