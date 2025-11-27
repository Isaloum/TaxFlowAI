# 💰 TaxSyncQC

**Quebec + Federal Tax Credits Estimator (2025)**

A free, open-source, bilingual (FR/EN) tool to estimate your tax credits and RRSP impact based on your RL-1 (Quebec) or T4 (Federal) slips.

🌐 **Live Web App:** [https://Isaloum.github.io/TaxSyncQC](https://Isaloum.github.io/TaxSyncQC)

---

## ✨ Features

### 🧮 **Accurate 2025 Calculations**
- **Quebec Credits:**
  - Solidarity Tax Credit (Crédit pour la solidarité) — up to $531
  - Work Premium (Prime au travail) — up to $728 single / $1,456 with dependents
- **Federal Credits:**
  - Basic Personal Amount (BPA) savings — $15,705 × 15%
  - Canada Workers Benefit (CWB / PTE) — up to $1,519
- **RRSP Impact:**
  - Tax savings at your marginal rate (28.85% / 33.25% / 38.85%)
  - Shows how RRSP contributions unlock hidden credits

### 🌍 **Fully Bilingual (FR/EN)**
- French-first design (Quebec default language)
- One-click toggle to English
- All labels, results, and warnings translate dynamically
- Proper Quebec terminology (NAS → SIN, RRQ → QPP, etc.)

### 🔒 **Privacy-First**
- **100% client-side** — all calculations run in your browser
- **No data sent to servers** — your tax info never leaves your device
- **No tracking, no cookies, no accounts** — completely anonymous
- Open source — audit the code yourself

### 🎯 **User-Friendly**
- **Simple mode:** 3 essential fields (income, union dues, SIN)
- **Advanced mode:** Full RL-1/T4 coverage (deductions, benefits, etc.)
- **Box/line referencing:** See exactly where to find data on your slips
  - RL-1 Box A → TP-1 Line 101
  - T4 Box 14 → T1 Line 10100
- **Structured JSON export:** For automation/integration with tax software

### 🚀 **Dual Interface**
- **Web UI:** Drag-and-drop interface at [isaloum.github.io/TaxSyncQC](https://isaloum.github.io/TaxSyncQC)
- **CLI tool:** \`node cli.js --rl1 "Case A: 60000" --rrsp 5000\`

---

## 📖 How to Use

### **Web App (Recommended)**

1. Visit **[https://Isaloum.github.io/TaxSyncQC](https://Isaloum.github.io/TaxSyncQC)**
2. Choose your slip type: **RL-1** (Quebec) or **T4** (Federal)
3. Enter your income (Box A / Box 14)
4. Optionally: Add union dues, adjust RRSP contribution slider
5. Click **"Estimer les crédits"** / **"Estimate Credits"**
6. See your instant results:
   - Total tax benefit
   - Cash refund breakdown
   - RRSP tax savings

**Toggle to Advanced Mode** to enter deductions (QPP, QPIP, RPP, charitable donations, etc.)

---

## 🔧 Technical Details

### **Tech Stack**
- **Frontend:** Vanilla JavaScript (ES6+ modules)
- **No dependencies** — pure HTML/CSS/JS
- **No build step** — works directly in any modern browser
- **Hosting:** GitHub Pages (static site)

### **Calculation Accuracy**
- ✅ Solidarity Credit: $531 base, phased out $57,965–$64,125
- ✅ Work Premium: 26% rate on income above $7,200, capped at $728
- ✅ Federal CWB: 27% build-up, 15% reduction after $25,539
- ✅ RRSP marginal rates: Combined QC+Fed rates (28.85% / 33.25% / 38.85%)

---

## 🛣️ Roadmap

### **Phase 1: MVP** ✅ *DONE*
- [x] Basic RL-1/T4 parsing
- [x] Quebec + Federal credit calculations
- [x] RRSP impact estimator
- [x] Bilingual web UI
- [x] CLI tool
- [x] GitHub Pages deployment

### **Phase 2: Enhanced UX** (Next 2 weeks)
- [ ] **PDF auto-extraction** — drag & drop your RL-1/T4 PDF → auto-fill boxes
- [ ] **RRSP optimizer chart** — visualize tax savings vs contribution
- [ ] **Multi-year comparison** — save & compare 2024 vs 2025

### **Phase 3: Pro Features** (Next month)
- [ ] **CRA/RQ XML export** — generate files for UFile/TurboTax
- [ ] **More credits:** Childcare, Medical, CCB
- [ ] **Multi-province support** — Ontario, BC, Alberta

---

## 📜 License

**MIT License** — free to use, modify, and distribute.

---

## 🙏 Credits

**Created by:** [Ihab Saloum](https://github.com/Isaloum)

**Built with AI assistance** — Demonstrating how electrical engineers can ship real software using Claude as a force multiplier.

---

## 💡 Why I Built This

As an electrical engineer in Quebec, I was frustrated with expensive tax software charging $20-50/year for basic estimates with no transparency and no RRSP optimizer.

So I built TaxSyncQC in **72 hours** using AI (Claude Sonnet 4.5) to give Quebecers a **free, transparent** tax estimator.

If this saves you money, consider ⭐ starring the repo or sharing with friends!

---

## ⚖️ Disclaimer

This tool provides **estimates only** and is **not a substitute for professional tax advice**. Always consult a qualified accountant for your final tax return.

**Use at your own risk.**

---

**🇨🇦 Made in Quebec, for Quebec. Fait au Québec, pour le Québec. 🇨🇦**
