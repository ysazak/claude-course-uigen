# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Build for production
npm run build

# Run all tests
npm run test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run new migrations
npx prisma migrate dev
```

**Environment:** Set `ANTHROPIC_API_KEY` in `.env` to use real Claude. Without it, the app runs with a mock provider that returns hardcoded components.

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface; Claude generates code into a virtual file system; a preview iframe renders the results in real time.

### Key Layers

**Virtual File System** (`src/lib/file-system.ts`)
All generated files exist only in memory — nothing is written to disk. The `VirtualFileSystem` class handles create/read/update/delete/rename and can serialize/deserialize state (used for database persistence).

**Dual Context System**
- `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) — owns the `VirtualFileSystem` instance and processes incoming tool calls from the AI.
- `ChatProvider` (`src/lib/contexts/chat-context.tsx`) — owns chat messages and streams responses from the API route.

These two contexts are the main coordination layer between the UI and the AI.

**AI Tool System** (`src/lib/tools/`)
The AI has two tools:
- `str_replace_editor` — create, view, and edit files (str_replace, insert operations)
- `file_manager` — rename and delete files

Tool calls are streamed from the API route and executed against the virtual file system inside `FileSystemProvider`.

**Language Model Provider** (`src/lib/provider.ts`)
Wraps `@ai-sdk/anthropic` using Claude Haiku 4.5. Falls back to `MockLanguageModel` when no API key is present. The mock returns static but realistic component code (Counter, Form, Card). Uses Anthropic's ephemeral prompt caching on the system message.

**JSX Preview** (`src/lib/transform/jsx-transformer.ts`, `src/components/preview/PreviewFrame.tsx`)
The preview iframe renders components by transpiling JSX to browser-runnable code with Babel standalone. `PreviewFrame` reads files from the virtual file system, transpiles them, and injects them into the iframe's srcdoc.

**API Route** (`src/app/api/chat/route.ts`)
Stateless streaming endpoint. Receives messages + serialized file state, calls the LLM with tools enabled, streams tool calls and text back to the client.

### Authentication

JWT-based auth (`src/lib/auth.ts`) with `jose`, 7-day expiry, passwords hashed with `bcrypt`. `src/middleware.ts` protects routes. Users can work anonymously; authenticated users get project persistence to SQLite via Prisma.

### Database

SQLite via Prisma. Reference `prisma/schema.prisma` as the source of truth for database structure. Two models:
- `User` — email + hashed password
- `Project` — stores serialized chat messages (`messages` JSON string) and serialized virtual file system (`data` JSON string), optionally linked to a user

Generated Prisma client lives at `src/generated/prisma` (not the default location).

### Styling & UI Components

Tailwind CSS v4 with PostCSS. Shadcn UI ("new-york" style) components in `src/components/ui/`. Path alias `@/*` maps to `src/*`.

### Test Structure

Tests use Vitest + jsdom + React Testing Library. Test files live in `__tests__/` directories colocated with source:
- `src/lib/__tests__/` — virtual file system, provider
- `src/lib/contexts/__tests__/` — context logic
- `src/lib/transform/__tests__/` — JSX transformer
- `src/components/chat/__tests__/` — chat components
- `src/components/editor/__tests__/` — file tree component
