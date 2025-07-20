#!/bin/bash

# Radiation Dose Tracking App - MCP Server Setup Script
echo "🚀 Setting up MCP servers for RadRoster project..."

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
GITHUB_REPO=your_username/radroster

# Linear
LINEAR_API_KEY=your_linear_api_key_here

# Sentry
SENTRY_AUTH_TOKEN=your_sentry_token_here
SENTRY_ORG=your_organization
SENTRY_PROJECT=radroster

# DuckDB
DUCKDB_PATH=./radroster_analytics.duckdb
EOF

echo "📝 Created .env.mcp file - please update with your actual tokens"

# Install MCP servers
echo "📦 Installing MCP servers..."

# Figma
npm install -g @modelcontextprotocol/server-figma

# Notion
npm install -g @modelcontextprotocol/server-notion

# GitHub
npm install -g @modelcontextprotocol/server-github

# Linear
npm install -g @modelcontextprotocol/server-linear

# Sentry
npm install -g @modelcontextprotocol/server-sentry

# Playwright
npm install -g @modelcontextprotocol/server-playwright
npx playwright install

# DuckDB
npm install -g @modelcontextprotocol/server-duckdb

echo "✅ MCP servers installed successfully!"

# Create DuckDB database file
touch radroster_analytics.duckdb

echo "📊 Created local DuckDB database for analytics"

# Create setup instructions
cat > MCP_SETUP_INSTRUCTIONS.md << 'EOF'
# MCP Server Setup Instructions

## Required Tokens & Credentials

### 1. Figma
- Go to Figma → Settings → Account → Personal access tokens
- Create a new token with read permissions
- Update `FIGMA_ACCESS_TOKEN` in `.env.mcp`

### 2. Notion
- Go to https://www.notion.so/my-integrations
- Create a new integration
- Share your database with the integration
- Update `NOTION_TOKEN` and `NOTION_DATABASE_ID` in `.env.mcp`

### 3. GitHub
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Create a token with repo permissions
- Update `GITHUB_TOKEN` and `GITHUB_REPO` in `.env.mcp`

### 4. Linear
- Go to Linear → Settings → API
- Create a new API key
- Update `LINEAR_API_KEY` in `.env.mcp`

### 5. Sentry
- Go to Sentry → Settings → Auth Tokens
- Create a new token with project:read permissions
- Update `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in `.env.mcp`

## Usage Examples

### Figma
- Extract UI components for React Native screens
- Get design tokens for consistent styling
- Export icons and assets

### Notion
- Store project documentation
- Track compliance checklists
- Maintain user manuals

### GitHub
- Create and manage issues
- Track pull requests
- Access code files

### Linear
- Track sprint tasks
- Manage development plan
- Monitor progress

### Sentry
- Monitor errors in production
- Track performance issues
- Alert on critical failures

### Playwright
- Run E2E tests
- Test offline sync
- Validate workflows

### DuckDB
- Analyze dose data locally
- Generate compliance reports
- Test data queries

## Testing MCP Servers

Run this command to test all servers:
```bash
source .env.mcp
# Test each server individually
```

## Project-Specific Use Cases

### For Radiation Dose Tracking App:

1. **Figma**: Extract mobile app UI components
2. **Notion**: Store compliance documentation
3. **GitHub**: Manage the 7-day sprint issues
4. **Linear**: Track dose tracking feature development
5. **Sentry**: Monitor safety-critical dose calculations
6. **Playwright**: Test dose entry workflows
7. **DuckDB**: Analyze dose data for compliance reports
EOF

echo "📚 Created MCP_SETUP_INSTRUCTIONS.md with detailed setup guide"

echo ""
echo "🎉 MCP server setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.mcp with your actual tokens"
echo "2. Read MCP_SETUP_INSTRUCTIONS.md for detailed setup"
echo "3. Test each server individually"
echo ""
echo "These MCP servers will help with:"
echo "  • Design-to-code workflow (Figma)"
echo "  • Documentation management (Notion)"
echo "  • Issue tracking (GitHub, Linear)"
echo "  • Error monitoring (Sentry)"
echo "  • E2E testing (Playwright)"
echo "  • Data analytics (DuckDB)" 