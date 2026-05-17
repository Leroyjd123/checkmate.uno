# Development Processes & Checklists

## Bug Tracking & Resolution

### When a Bug is Found
1. Document: What's broken, where, reproduction steps
2. Assign: Which developer owns it
3. Priority: CRITICAL, HIGH, MEDIUM, LOW
4. Status: BLOCKED, IN_PROGRESS, READY_FOR_QA, FIXED

### Bug Fix Checklist
- [ ] Bug reproduced locally
- [ ] Root cause identified
- [ ] Fix applied to code
- [ ] Tested locally in browser
- [ ] Console/logs clean
- [ ] Code compiles
- [ ] Committed with clear message
- [ ] Marked READY_FOR_QA

---

## Code Review Process

### Before Submitting Code
1. Code compiles (no TypeScript errors)
2. No console errors in browser
3. Feature tested end-to-end
4. Edge cases verified
5. Committed with descriptive message
6. Documentation updated if needed

### Code Review Checklist
- [ ] Does it solve the stated problem?
- [ ] Is the code understandable?
- [ ] Are there obvious bugs?
- [ ] Performance acceptable?
- [ ] Security concerns?
- [ ] Tests passing?

---

## Git Workflow

### Creating a Fix Commit
```bash
# Make changes, test locally
git add [specific files]
git commit -m "fix: [component] - [what was broken and how it's fixed]"
git push
```

### Commit Message Format
- `fix:` for bug fixes
- `feat:` for new features
- `refactor:` for code cleanup
- `docs:` for documentation
- Include brief what/why, not just what

---

## Database Setup

### Initial Setup
1. PostgreSQL running (Supabase or local)
2. `.env` configured with DATABASE_URL
3. Run: `npx prisma migrate dev --name init`
4. Schema created and ready
5. Test connection: `npm run test`

### Adding Migrations
1. Update `prisma/schema.prisma`
2. Run: `npx prisma migrate dev --name [migration_name]`
3. Test database changes
4. Commit schema + migration files

---

## Testing Standards

### Frontend Testing
- Load app in browser (`npm run dev`)
- Click all buttons touched in your code
- Verify feature works end-to-end
- Check browser console for errors
- Test edge cases (empty state, errors, etc.)
- **Do not submit code without this step**

### Backend Testing
- Run test suite: `npm test`
- Test endpoints with curl/Postman
- Verify response format
- Check error handling
- Test with valid AND invalid data
- **All tests must pass before submission**

---

## QA Process Standards

### QA Responsibilities
- Test compiled, working code (not broken code)
- Run full test suite on submitted code
- Find edge cases and issues
- Validate features work as specified
- Report specific failures only

### Developer Responsibility
- Code must compile without errors
- Code must be tested by developer first
- Code must run without crashes
- Developer must test in real browser/env
- **QA is not the testing department**

---

## Integration Checklist

### Frontend-Backend Integration
- [ ] Auth endpoints verified working (register, login)
- [ ] JWT token properly issued and stored
- [ ] API calls include auth headers
- [ ] Game creation endpoint working
- [ ] Game state syncing correctly
- [ ] Moves executing properly
- [ ] Cards system integrated
- [ ] WebSocket real-time updates working
- [ ] Error handling in place
- [ ] End-to-end game playable

### Before Phase 4 GO
- [ ] All 8 bugs fixed
- [ ] Code compiles clean
- [ ] Developer tested locally
- [ ] QA approved all features
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Zero critical blockers

---

## Design Testing

### When Reviewing UI Changes
1. Visual consistency (colors, spacing, fonts)
2. Responsive design (mobile, tablet, desktop)
3. Dark/light theme support
4. Accessibility (button states, contrast)
5. Animation smoothness
6. Error states visible and clear

---

## Documentation Updates

### When to Update Docs
- New feature added → Document in README
- API changed → Update BACKEND_API_REFERENCE.md
- Architecture decision made → Update TRD
- Process changed → Update PROCESSES.md
- Bug fixed → Mark in BUG_TRACKING or remove if documented elsewhere

### Documentation Checklist
- [ ] Changes described clearly
- [ ] Examples/code snippets provided
- [ ] Related docs cross-linked
- [ ] No outdated information
- [ ] Formatted consistently
