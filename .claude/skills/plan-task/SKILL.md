---
name: plan-task
description: >
  Analyzes Jira tickets and creates implementation plans.
  Use when starting a new ticket, breaking down features,
  or evaluating technical approach before coding.
---

# Plan Task

Analyze a ticket and produce an implementation checklist before writing code.

## Context Files to Load
- `contexts/structure/project-layout.md` — where things go (core/, features/, shared/)
- `contexts/structure/feature-module.md` — creation order, screaming architecture
- `contexts/patterns/composables.md` — if feature needs API data
- `contexts/patterns/components.md` — if feature needs UI

## Process

### 1. Read the Ticket
- Get ticket details via Jira MCP
- Understand acceptance criteria

### 2. Review Existing Code
- Check if feature module exists in `src/features/`
- Look at related composables, mappers, types
- Check `shared/` for reusable pieces
- Check `core/api/api-routes.ts` for existing route constants

### 3. Research (if needed)
- Check `.claude/ledger/research/` for cached findings
- If unfamiliar APIs needed → Context7 query
- Save new findings to research cache

### 4. Create Checklist

```markdown
## Plan: TTV-XXX — [Feature Name]

### Types
- [ ] Create `types/responses/{entity}-{projection}.response.ts` (IApi* + I* pair)
- [ ] Create `types/requests/{action}-{entity}.request.ts` if needed

### Mappers
- [ ] Create `mappers/{entity}-{projection}.mapper.ts`

### Data Layer
- [ ] Add routes to `core/api/api-routes.ts` (if new module)
- [ ] Create `constants/query-keys.ts` (factory functions)
- [ ] Create `composables/queries/use-{entity}-{projection}.ts`
- [ ] Create `composables/mutations/use-{action}-{entity}.ts`

### Presentation
- [ ] Create `presentation/components/{Entity}{Descriptor}.vue`
- [ ] Create `presentation/views/{Entity}{Action}View.vue`

### Wiring
- [ ] Create `routes.ts` with DRY path constant
- [ ] Register in `app/router.ts`
- [ ] Verify lint + build pass
```

## Output

An ordered checklist that `implement-feature` can follow step by step.
