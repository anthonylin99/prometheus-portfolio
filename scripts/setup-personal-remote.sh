#!/bin/bash
# One-time: set origin to use anthonylin99 (personal) so pushes use your personal account.
set -e
cd "$(dirname "$0")/.."
echo "Setting origin to https://anthonylin99@github.com/anthonylin99/prometheus-portfolio.git"
git remote set-url origin "https://anthonylin99@github.com/anthonylin99/prometheus-portfolio.git"
echo "Done. Current remotes:"
git remote -v
echo ""
echo "Next: git push -u origin main"
echo "When prompted for password, use a PAT for anthonylin99: https://github.com/settings/tokens"
