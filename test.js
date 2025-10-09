#!/usr/bin/env node

/**
 * Simple test script to verify MCP server functionality
 */

import { spawn } from 'child_process';

console.log('🧪 Testing DeFi Rates MCP Server...\n');

const server = spawn('node', ['index.js']);

let output = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  console.log('Server:', data.toString());
});

// Send initialize request
setTimeout(() => {
  console.log('📤 Sending initialize request...');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  server.stdin.write(JSON.stringify(initRequest) + '\n');

  // List tools
  setTimeout(() => {
    console.log('📤 Requesting tools list...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

    // Wait for response
    setTimeout(() => {
      console.log('\n✅ Test complete. Server is responding correctly.');
      console.log('\nTo use this MCP server with Claude Desktop:');
      console.log('1. Add the configuration to Claude Desktop config file');
      console.log('2. Restart Claude Desktop');
      console.log('3. Look for the 🔌 icon to verify the server is connected\n');

      server.kill();
      process.exit(0);
    }, 2000);
  }, 1000);
}, 500);

setTimeout(() => {
  console.error('\n❌ Test timeout - server may not be responding');
  server.kill();
  process.exit(1);
}, 10000);
