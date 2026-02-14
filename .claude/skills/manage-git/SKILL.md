---
name: manage-git
description: >
  Manages git operations and Jira ticket lifecycle.
  Use when creating branches, committing, pushing, creating PRs,
  or transitioning Jira tickets.
  Triggers: "commit", "push", "branch", "PR", start/end of ticket
---

# Manage Git & Jira

Handle git operations and Jira ticket lifecycle.

## Context Files to Load
- `contexts/conventions/git.md` — branch, commit, and Jira conventions

## Start of Ticket

```bash
# 1. Transition Jira → "In Progress" (via MCP)
# 2. Create branch
git checkout main
git pull origin main
git checkout -b feat/TTV-XXX
```

## During Implementation

Commit at logical checkpoints:
```bash
git add .
git commit -m "feat({scope}): [TTV-XXX] {description}"
```

## End of Ticket

```bash
# 1. Verify
pnpm lint
pnpm build

# 2. Push
git push -u origin feat/TTV-XXX

# 3. Create PR — title: [TTV-XXX] Brief description

# 4. Jira transitions (via MCP)
#    → "Ready for Review"
#    → Add PR link as comment
```

## Context Keeping

When starting a ticket, note in the conversation what you plan to do.
This helps recover context if the session is interrupted.
