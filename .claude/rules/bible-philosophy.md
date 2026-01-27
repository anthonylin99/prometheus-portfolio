# Bible philosophy (Claude Code rule)

**All code, refactors, and design decisions must align with [bible.md](../../bible.md).**

This rule applies when working in this repo from **Claude Code** (and is mirrored for **Cursor** in `.cursor/rules/`). Before proposing changes:

1. **Read bible.md** — Prime Directive, Core Engineering Pillars, Considerate Coworker protocol, Tactical Implementation Checklist, Fighting Entropy.
2. **Apply it** — no quick fixes that violate architecture; fail loudly (no empty catches); immutable-by-default in financial logic; strict typing; document the "why"; leave the campsite cleaner; consider ripple effects; preserve tests and safety checks.
3. **Filter every change** by idempotency, observability, separation of concerns, and edge-case resilience (see Tactical Implementation Checklist in bible.md).

If a suggestion conflicts with bible.md, reject or revise the suggestion.
