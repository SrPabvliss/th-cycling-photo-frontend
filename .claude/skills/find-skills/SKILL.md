---
name: find-skills
description: >
  Discovers and selects the right skill for the current task.
  ALWAYS invoke this FIRST before starting any work.
  Use when: starting any task, unsure which skill applies,
  beginning a ticket, or switching activities.
---

# Find Skills

Route tasks to the correct skill before starting work.

## Skill Catalog

### `plan-task`
**Triggers:** "planifica", "analiza", "trabaja en TTV-XXX", starting a new ticket
**Does:** Reads ticket, reviews existing code, creates implementation checklist.

### `implement-feature`
**Triggers:** "implementa", "crea", "agrega", "conecta", building UI
**Does:** Guides implementation following Vue 3 patterns and project structure.

### `manage-git`
**Triggers:** "commit", "push", "branch", "PR", starting/finishing a ticket
**Does:** Git operations and Jira ticket lifecycle.

## Decision Flow

```
"Work on TTV-XXX" / "Plan..."       → plan-task
"Build..." / "Create..." / "Add..." → implement-feature
"Commit" / "Push" / "PR"            → manage-git
Full ticket workflow                 → manage-git → plan-task → implement-feature → manage-git
None match                           → Use CLAUDE.md conventions directly
```
