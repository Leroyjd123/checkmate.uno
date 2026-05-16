# Git Workflow & Commit Strategy

This project adheres to a strict Git push and commit strategy. All AI agents, developers, and contributors MUST follow these rules to maintain a clean, readable, and perfectly organized Git history.

## 1. Conventional Commits (Strict Rule)

Every single commit must be prefixed with a type and scope. This allows us to easily distinguish features from bug fixes and chores.

**Format:**
```
<type>(<scope>): <description>
```

**Allowed Types:**
- `feat:` A new feature or complete chunk of game logic (e.g., `feat(backend): implement websocket gateway`).
- `fix:` A bug fix (e.g., `fix(frontend): resolve chess board rendering issue on Safari`).
- `docs:` Documentation only changes (e.g., `docs(project): update README phase status`).
- `chore:` Build process, dependencies, tooling, or project setup (e.g., `chore(backend): initialize nestjs`).
- `test:` Adding or correcting tests (e.g., `test(backend): add unit tests for power cards`).
- `refactor:` Code changes that neither fix a bug nor add a feature.
- `style:` Formatting changes only (no code logic changes).

## 2. Atomic Commits

Commits must be **atomic**. 
- A single commit must contain code related to *only one* specific type and scope.
- **NEVER** combine a feature and a bug fix in the same commit.
- **NEVER** combine frontend and backend changes in the same commit unless they are inextricably linked by a single specific feature.

## 3. Branching Strategy

- `main` is the production-ready, stable branch.
- All new work must be done on a separate branch.
- Branch naming convention:
  - `feature/<feature-name>` (for `feat:` commits)
  - `bugfix/<bug-name>` (for `fix:` commits)
  - `docs/<doc-name>` (for `docs:` commits)

## 4. Push Implementation

When pushing code, review your commits via `git log`. If a commit violates the Conventional Commits structure, you must `git commit --amend` or rebase to fix it before pushing.

By following this strict structure, our Git log will automatically serve as a clean changelog!
