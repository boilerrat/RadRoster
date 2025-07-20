#!/usr/bin/env node

// Simple test to verify MCP servers are installed and accessible
const { spawn } = require('child_process');

const servers = [
  { name: 'GitHub', command: '@modelcontextprotocol/server-github' },
  { name: 'Supabase', command: '@supabase/mcp-server-supabase' },
  { name: 'Filesystem', command: '@modelcontextprotocol/server-filesystem' },
  { name: 'Figma', command: 'figma-mcp' },
  { name: 'Notion', command: '@notionhq/notion-mcp-server' },
  { name: 'Sentry', command: '@sentry/mcp-server' },
  { name: 'Puppeteer', command: '@hisma/server-puppeteer' },
  { name: 'Kubernetes', command: 'mcp-server-kubernetes' },
  { name: 'Heroku', command: '@heroku/mcp-server' }
];

async function testServer(server) {
  return new Promise((resolve) => {
    console.log(`Testing ${server.name}...`);
    
    const child = spawn('npx', [server.command], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    });

    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 || output.includes('stdio') || output.includes('MCP')) {
        console.log(`✅ ${server.name} - Working`);
        resolve(true);
      } else {
        console.log(`❌ ${server.name} - Error: ${output.substring(0, 100)}...`);
        resolve(false);
      }
    });

    child.on('error', (error) => {
      console.log(`❌ ${server.name} - Not found: ${error.message}`);
      resolve(false);
    });

    // Kill after 3 seconds
    setTimeout(() => {
      child.kill();
      console.log(`⏰ ${server.name} - Timeout`);
      resolve(false);
    }, 3000);
  });
}

async function testAllServers() {
  console.log('🧪 Testing MCP Servers...\n');
  
  const results = [];
  
  for (const server of servers) {
    const working = await testServer(server);
    results.push({ name: server.name, working });
  }
  
  console.log('\n📊 Results:');
  console.log('==========');
  
  const working = results.filter(r => r.working);
  const failed = results.filter(r => !r.working);
  
  console.log(`✅ Working: ${working.length}/${servers.length}`);
  working.forEach(r => console.log(`  - ${r.name}`));
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${servers.length}`);
    failed.forEach(r => console.log(`  - ${r.name}`));
  }
  
  console.log(`\n🎯 Success Rate: ${Math.round((working.length / servers.length) * 100)}%`);
}

testAllServers().catch(console.error); 