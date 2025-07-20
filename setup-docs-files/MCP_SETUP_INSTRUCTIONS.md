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
