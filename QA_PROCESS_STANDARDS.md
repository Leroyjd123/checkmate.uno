# QA PROCESS & STANDARDS
**Authority:** Daniel (QA Specialist)  
**Effective Date:** May 17, 2026  
**Classification:** MANDATORY - ALL DEVELOPERS

---

## EXECUTIVE SUMMARY

QA is not a dumping ground for untested code. Code submitted to QA must meet minimum quality standards or it will be **REJECTED IMMEDIATELY**.

**Standard:** Code must compile and run without syntax errors before reaching QA testing.

---

## DEVELOPER RESPONSIBILITIES (PRE-QA)

### Before Code Reaches QA, Developer MUST:

1. **Compile Check** ✅
   - Run: `npm run build` (frontend) or `npm run dev:build` (backend)
   - Result: Zero compiler errors
   - Acceptance: Build completes without errors

2. **Local Execution** ✅
   - Run: `npm run dev` (frontend) or `npm start` (backend)
   - Verify: Server starts without crashes
   - Check: No critical errors in console/logs
   - Acceptance: Server is up and responsive

3. **Smoke Test** ✅
   - Open application in browser/test client
   - Test the fixed feature works at basic level
   - Verify: No obvious failures
   - Acceptance: Feature is not obviously broken

4. **Code Review (Self)** ✅
   - Check your own code for syntax errors
   - Verify all braces/parentheses/quotes match
   - Check imports are valid
   - Verify no console errors appear
   - Acceptance: Code passes basic review

### Submission Checklist

```
[ ] Code compiles without errors
[ ] Dev server/backend starts without crashes
[ ] Smoke test: feature doesn't crash on basic usage
[ ] No syntax errors visible in code review
[ ] Console/logs show no critical errors
[ ] Ready to submit to QA
```

**If ANY checkbox fails: DO NOT SUBMIT TO QA**

---

## QA ACCEPTANCE CRITERIA

### Code QA Will Accept:
✅ Code that compiles  
✅ Code that runs without syntax errors  
✅ Code where the application starts  
✅ Code ready for functional testing

### Code QA Will REJECT:
❌ Code with syntax errors (unbalanced braces, quotes, etc.)  
❌ Code that fails to compile  
❌ Code where the app crashes on startup  
❌ Code not smoke-tested by developer  
❌ Code obviously not reviewed by developer

### QA Response to Non-Compliant Code

**When QA receives broken code:**
1. Immediately mark as **REJECTED**
2. Document the specific failure (build error, runtime crash, syntax issue)
3. Return to developer
4. **Code sits in REJECTED status until fixed**

**No testing will begin.** QA does not debug syntax errors or compilation failures.

---

## QA PROCESS FLOW

```
DEVELOPER → BUILD & TEST LOCALLY → SMOKE TEST → SUBMIT TO QA
                    ↑                              ↓
              MUST PASS ALL                   [QA Reviews]
                                                   ↓
                                      DOES IT COMPILE? NO
                                            ↓
                                        REJECT
                                         Return to Dev
                                            ↑
                                      Fix & Resubmit
```

---

## TESTING PHASES (QA Only)

Once code passes acceptance criteria:

### Phase 1: Build Verification (5 min)
- [ ] Code compiles in CI/CD environment
- [ ] Frontend dev server starts
- [ ] Backend endpoints respond
- [ ] No console errors on startup

### Phase 2: Functional Testing (15-30 min)
- [ ] Execute test cases for the bug fix
- [ ] Verify feature works as intended
- [ ] Check for regressions
- [ ] Document results

### Phase 3: Report & Results (5 min)
- [ ] PASS: Feature verified working
- [ ] FAIL: Specific failures documented
- [ ] Return to dev if needed

---

## SUBMISSION TEMPLATE

**Developer:** [Name]  
**Date:** [Date]  
**Bug/Feature:** [Bug #X or Feature Y]  

**Pre-QA Checklist:**
- [ ] Build passes: `npm run build` ✅
- [ ] Dev server starts: `npm run dev` ✅
- [ ] Smoke test passed ✅
- [ ] Code reviewed for syntax ✅
- [ ] No critical console errors ✅

**Changes Made:**
- [Brief description of fix]
- [Files modified]

**Ready for QA Testing:** YES / NO

---

## CONSEQUENCES

### For Code Not Meeting Standards:

1. **First Rejection:** Developer warning. Documentation required.
2. **Second Rejection:** QA escalates to lead. Code review required before resubmission.
3. **Repeated Violations:** QA blocks all submissions until developer completes code review training.

---

## STANDARDS ARE NOT NEGOTIABLE

- Syntax errors in submitted code = Developer failure, not QA failure
- QA tests working code, not broken code
- QA does not fix syntax errors
- QA does not debug compilation issues
- Developers are responsible for basic code quality

---

## QA ROLE CLARITY

**QA Tests:** Working features, edge cases, regressions, user experience  
**QA Does NOT:** Debug code, fix syntax, solve compilation issues, do developer's job

**Developer Role Clarity:**

**Developer Delivers:** Working, compiling, runnable code  
**Developer Does NOT:** Skip testing, submit broken code, expect QA to fix issues

---

## SIGN-OFF

**QA Authority:** Daniel (QA Specialist)  
**Effective:** May 17, 2026  
**Scope:** All developers, all submissions  
**Status:** MANDATORY

This standard applies to 100% of code submissions. No exceptions.

---

**Next Submission:** Code must meet all criteria in this document.

