# Push from Personal Account (anthonylin99)

This repo is **anthonylin99/prometheus-portfolio**. Your work account (anthonylinartemis) does not have push access. Use your **personal** account.

---

## One-time setup

Run in a terminal from the **pathfinder-etf** folder:

```bash
cd "/Users/anthony_lin_99/Desktop/Personal Vibe Code/Website Portfolio/pathfinder-etf"

# 1) Point origin at your personal user so Git uses anthonylin99, not work
git remote set-url origin "https://anthonylin99@github.com/anthonylin99/prometheus-portfolio.git"
git remote -v
# Should show: origin  https://anthonylin99@github.com/anthonylin99/prometheus-portfolio.git (fetch and push)
```

---

## Personal Access Token (PAT) for anthonylin99

GitHub no longer accepts account passwords for `git push`. Use a **Personal Access Token**:

1. In a browser, log into **GitHub as anthonylin99** (personal).
2. Go to: **https://github.com/settings/tokens**
3. **Generate new token (classic)** → name it e.g. `prometheus-portfolio` → enable **repo** → Generate.
4. Copy the token (starts with `ghp_...`). You’ll paste it when Git asks for a “password”.

---

## Push (each time)

```bash
cd "/Users/anthony_lin_99/Desktop/Personal Vibe Code/Website Portfolio/pathfinder-etf"
git push -u origin main
```

- When prompted for **password**, paste the **PAT** for anthonylin99 (not your work account).
- macOS Keychain will store it for `anthonylin99@github.com` so you aren’t asked every time.

Or:

```bash
bash scripts/push-to-github.sh
```

---

## If it still uses your work account

Your system may have cached credentials for `github.com` under the work account.

**Option A – GitHub CLI (easy)**  
Use `gh` as anthonylin99, then push:

```bash
gh auth login
# Choose: GitHub.com → HTTPS → Login with a web browser
# Log in as **anthonylin99** in the browser.

gh auth status
# Should show: Logged in to github.com as anthonylin99

git push -u origin main
```

When done with personal pushes, you can run `gh auth switch` to change back to your work account if you use it for other repos.

**Option B – Clear cached GitHub credentials and re-enter**  
Only if you’re sure you want to clear **all** stored GitHub HTTPS credentials for this Mac user:

```bash
printf "protocol=https\nhost=github.com\n" | git credential reject
```

Then run `git push -u origin main` again. When asked for password, paste the **anthonylin99** PAT. It will be stored for `anthonylin99@github.com`.

---

## Verify after push

```bash
gh repo clone anthonylin99/prometheus-portfolio /tmp/pp-verify
git -C /tmp/prometheus-verify log --oneline -5
```

You should see your latest commits (e.g. `5faad1a`, `c06ca9e`, `03780da`, …).
