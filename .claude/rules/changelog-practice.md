# Changelog Practice (Claude Code Rule)

**After every major update or implementation phase, create a detailed changelog document.**

## Requirements

1. **Location**: `docs/changelogs/[MM-DD]-[phase-name].txt`
   - Example: `1-28-phase-2.txt`, `2-15-hotfix-auth.txt`

2. **Format**: Plain text, readable by anyone new to the project

3. **Required Sections**:
   - OVERVIEW: Brief summary and design philosophy
   - For each feature/fix:
     - Files Modified/Created
     - Detailed changes with code snippets where helpful
     - Why the change was made
   - BUILD VERIFICATION: TypeScript check and build status
   - DEPENDENCIES: Any new packages added
   - TESTING RECOMMENDATIONS: How to verify changes work
   - KNOWN LIMITATIONS: Any caveats or edge cases

4. **Tone**: Write as if passing the project to someone entirely new who needs to understand what changed and why.

5. **Timing**: Create the changelog BEFORE committing/pushing to production.

## Example Header

```
================================================================================
PROMETHEUS ETF - [PHASE NAME] CHANGELOG
Date: [Month Day, Year]
================================================================================
```

This practice ensures continuity across development sessions and makes debugging easier.
