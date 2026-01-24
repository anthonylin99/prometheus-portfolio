#!/bin/bash
# Push to anthonylin99/prometheus-portfolio using your PERSONAL account (anthonylin99).
# Remote is set to https://anthonylin99@github.com/... so Git prompts for anthonylin99's token.
set -e
cd "$(dirname "$0")/.."
echo "Repo: $(pwd)"
echo "Remote (personal): $(git remote get-url origin)"
echo "Branch: main"
echo ""
echo "If prompted for password: use a Personal Access Token for anthonylin99 (not your work account)."
echo "  Create at: https://github.com/settings/tokens (repo scope)."
echo ""
echo "Pushing..."
git push -u origin main
echo "Done. Verify: gh repo clone anthonylin99/prometheus-portfolio /tmp/pp-verify && git -C /tmp/pp-verify log --oneline -5"
