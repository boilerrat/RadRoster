#!/bin/bash

# Radiation Dose Tracking App - Corrected MCP Server Setup Script
echo "🚀 Setting up MCP servers for RadRoster project (Corrected Version)..."

# Create .env file for MCP configuration
cat > .env.mcp << EOF
# MCP Server Configuration
# Replace these with your actual tokens and credentials

# Figma
FIGMA_ACCESS_TOKEN=your_figma_token_here

# Notion
NOTION_TOKEN=your_notion_token_here
NOTION_DATABASE_ID=your_database_id_here

# GitHub
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=boilerrat/radroster

# Sentry
SENTRY_AUTH_TOKEN=your_sentry_token_here
SENTRY_ORG=your_organization
SENTRY_PROJECT=radroster

# DuckDB
DUCKDB_PATH=./radroster_analytics.duckdb

# Supabase (alternative to direct database access)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
EOF

echo "📝 Created .env.mcp file - please update with your actual tokens"

# Install MCP servers
echo "📦 Installing MCP servers..."

# Figma
echo "Installing Figma MCP server..."
npm install -g figma-mcp

# Notion
echo "Installing Notion MCP server..."
npm install -g @notionhq/notion-mcp-server

# GitHub (already installed)
echo "GitHub MCP server already installed"

# Sentry
echo "Installing Sentry MCP server..."
npm install -g @sentry/mcp-server

# Filesystem
echo "Installing Filesystem MCP server..."
npm install -g @modelcontextprotocol/server-filesystem

# Playwright (using Puppeteer alternative)
echo "Installing Puppeteer MCP server..."
npm install -g @hisma/server-puppeteer

# Supabase (alternative for database operations)
echo "Installing Supabase MCP server..."
npm install -g @supabase/mcp-server-supabase

# Kubernetes (for deployment)
echo "Installing Kubernetes MCP server..."
npm install -g mcp-server-kubernetes

# Heroku (for deployment)
echo "Installing Heroku MCP server..."
npm install -g @heroku/mcp-server

echo "✅ MCP servers installed successfully!"

# Create DuckDB database file
touch radroster_analytics.duckdb

echo "📊 Created local DuckDB database for analytics"

# Create corrected setup instructions
cat > MCP_SETUP_INSTRUCTIONS_CORRECTED.md << 'EOF'
# Corrected MCP Server Setup Instructions

## Actually Available Servers

### 1. Figma (`figma-mcp`)
- Go to Figma → Settings → Account → Personal access tokens
- Create a new token with read permissions
- Update `FIGMA_ACCESS_TOKEN` in `.env.mcp`

### 2. Notion (`@notionhq/notion-mcp-server`)
- Go to https://www.notion.so/my-integrations
- Create a new integration
- Share your database with the integration
- Update `NOTION_TOKEN` and `NOTION_DATABASE_ID` in `.env.mcp`

### 3. GitHub (`@modelcontextprotocol/server-github`)
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Create a token with repo permissions
- Update `GITHUB_TOKEN` and `GITHUB_REPO` in `.env.mcp`

### 4. Sentry (`@sentry/mcp-server`)
- Go to Sentry → Settings → Auth Tokens
- Create a new token with project:read permissions
- Update `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in `.env.mcp`

### 5. Filesystem (`@modelcontextprotocol/server-filesystem`)
- No configuration needed
- Provides file system access

### 6. Puppeteer (`@hisma/server-puppeteer`)
- Alternative to Playwright for browser automation
- No additional configuration needed

### 7. Supabase (`@supabase/mcp-server-supabase`)
- Go to your Supabase project → Settings → API
- Copy the URL and keys
- Update `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.mcp`

### 8. Kubernetes (`mcp-server-kubernetes`)
- Requires kubectl to be installed and configured
- No additional configuration needed

### 9. Heroku (`@heroku/mcp-server`)
- Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
- Run `heroku login`
- No additional configuration needed

## Project-Specific Use Cases

### For Radiation Dose Tracking App:

1. **Figma**: Extract mobile app UI components and design tokens
2. **Notion**: Store nuclear industry compliance documentation
3. **GitHub**: Manage the 7-day sprint issues and code reviews
4. **Sentry**: Monitor errors in safety-critical dose calculations
5. **Filesystem**: Access and manipulate local files, including DuckDB
6. **Puppeteer**: Test dose entry workflows in browser
7. **Supabase**: Database operations and real-time features
8. **Kubernetes**: Deploy and manage infrastructure
9. **Heroku**: Deploy the application

## Testing MCP Servers

Run this command to test all servers:
```bash
source .env.mcp
# Test each server individually
```

## What's Not Available

- **Linear**: No official MCP server - use GitHub issues instead
- **DuckDB**: No direct MCP server - use filesystem server to interact with DuckDB files
- **Playwright**: Use Puppeteer alternative for browser automation

## Alternative Workflows

### Instead of Linear:
- Use GitHub issues for project management
- Use GitHub projects for kanban boards
- Use GitHub milestones for sprint planning

### Instead of DuckDB MCP:
- Use filesystem server to read/write DuckDB files
- Use Supabase server for database operations
- Use local SQLite with filesystem access

### Instead of Playwright:
- Use Puppeteer for browser automation
- Use filesystem server for file operations
- Use GitHub for issue tracking
EOF

echo "📚 Created MCP_SETUP_INSTRUCTIONS_CORRECTED.md with corrected setup guide"

echo ""
echo "🎉 Corrected MCP server setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.mcp with your actual tokens"
echo "2. Read MCP_SETUP_INSTRUCTIONS_CORRECTED.md for detailed setup"
echo "3. Test each server individually"
echo ""
echo "These MCP servers will help with:"
echo "  • Design-to-code workflow (Figma)"
echo "  • Documentation management (Notion)"
echo "  • Issue tracking (GitHub)"
echo "  • Error monitoring (Sentry)"
echo "  • File operations (Filesystem)"
echo "  • Browser testing (Puppeteer)"
echo "  • Database operations (Supabase)"
echo "  • Deployment (Kubernetes, Heroku)" 