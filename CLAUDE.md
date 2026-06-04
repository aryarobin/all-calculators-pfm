# GoalFi PFM Calculators — Claude Context

## What this project is
India's most comprehensive personal finance calculator suite — 22 calculators for Indian retail investors.
Branded under GoalFi. SEO-first, India-specific (tax slabs, PPF, NPS, ELSS, XIRR, etc.).
Stack: React 18 + Vite + Tailwind CSS (JavaScript, not TypeScript).

## Current state
Built and active. Recent commits show ongoing feature additions.
Deployment options: Netlify (netlify.toml configured) + GCP Cloud Run (deploy-gcp.sh).

## Calculators (22 total)

**Investments**
- SIP Calculator, Lumpsum Calculator, Step-Up SIP, Compare Instruments (FD vs PPF vs MF vs NPS)

**Goals & Retirement**
- Goal Planning, Retirement Planner, Retirement Readiness Dashboard, SWP / Income & Withdrawal
- Financial Freedom (FIRE), Coast FIRE

**Smart Decisions**
- Prepay vs Invest (home loan), Rent vs Buy

**Analysis**
- XIRR Calculator, Financial Timeline, CAGR Calculator, Money Multiplier

**Tax & Income**
- Tax Calculator, Salary Calculator, EMI Calculator, FD/PPF Calculator, Budget Planner, Inflation Calculator

## File structure
```
all-calculators-pfm/
├── pfm-calculators/          # Main React+Vite app
│   ├── src/
│   │   ├── calculators.js    # Single source of truth — all calculator metadata + slugs
│   │   ├── components/
│   │   │   ├── calculators/  # One .jsx per calculator (22 files)
│   │   │   ├── Dashboard.jsx
│   │   │   └── shared/
│   ├── netlify.toml          # Netlify deploy config
│   └── Dockerfile
├── reference-calculations/   # Excel reference models
└── deploy-gcp.sh             # GCP Cloud Run deploy script
```

## Key file — always check before adding calculators
`src/calculators.js` is the single source of truth for all calculator metadata (id, slug, name, group, SEO title, SEO desc). Add here first before creating the component.

## Related repos
- `goalfi-platform` — main GoalFi product; calculators may be embedded here
- `lens-goalfi` — screener; calculators complement the research tools
- `goalfi-advisory` — advisory portal; calculator tools useful for position sizing

---

## Cross-project reference — always check before building
**Master state of all GoalFi repos:**
`/Users/GoalFiTech/claude_projects/all_project_summary_git/GOALFI_PROJECT_STATE.md`

**Rules:**
1. Read the master state before writing any new code
2. If the capability exists in another repo — reuse or import it, never rebuild
3. Copy the best patterns from sibling repos
4. All repos are local at `/Users/GoalFiTech/claude_projects/[repo-name]`
5. `git pull` before starting, `git push` after every session

**End of every session — update the master state:**
Edit `/Users/GoalFiTech/claude_projects/all_project_summary_git/GOALFI_PROJECT_STATE.md` to reflect what changed, then commit and push `all_project_summary_git`.

---

## Git & GitHub accounts — IMPORTANT
- This repo's remote is **`aryarobin/all-calculators-pfm`**. Push as the **`aryarobin`** GitHub account (the repo owner).
- There are **two** GitHub accounts authenticated on this machine via `gh`: `aryarobin` (active, has write) and **`goalfitech` (READ-ONLY — never push as this account, only read/clone)**.
- Pitfall: plain `git push` may pull a stale `goalfitech` token from the macOS Keychain → `403 denied to goalfitech`. Git is configured to auth via `gh` (`gh auth setup-git`) so it uses the active `aryarobin` account. If a push is ever denied to `goalfitech` again, run `gh auth setup-git` (and ensure `gh auth status` shows `aryarobin` active) before retrying.
- Never push to / commit into anything under the `goalfitech` account — it is for reading only.
