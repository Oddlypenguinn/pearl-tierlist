# Pearl Tierlist (React + Tailwind, auto from Google Sheets)

This is a ready-to-deploy **tierlist** site that pulls data directly from a **Google Sheet** you control.

## 1) Get your Google Sheet CSV URL
1. Open your sheet → **File → Share → Publish to web**.
2. Choose **Entire document** (or a specific sheet) and **CSV**.
3. Copy the link. It will look like:
```
https://docs.google.com/spreadsheets/d/XXXXXXXXXXXX/pub?gid=1543047101&single=true&output=csv
```
> Tip: If you have multiple tabs (NethPot, Vanilla, etc.), publish each tab separately and deploy multiple sites or extend the code to switch URLs by tab.

## 2) Configure the site
Create a `.env` file (copy from `.env.example`) and paste your CSV link:
```
VITE_SHEET_CSV="https://docs.google.com/spreadsheets/d/.../pub?gid=1543047101&single=true&output=csv"
```

## 3) Run locally
```bash
npm install
npm run dev
```

## 4) Deploy
### Vercel
- Import this repo on vercel.com
- Build Command: `npm run build`
- Output Directory: `dist`

### GitHub Pages (optional)
- Build locally and push the `dist/` folder to a `gh-pages` branch or use a GitHub Action.

---

## CSV format this app understands
Two common sheet layouts are supported:

### A. **Single Column with Tier/Player**
```
tier,player,region
Tier 1,SomeName,AS
Tier 2,AnotherName,NA
```
- `tier` must contain `Tier 1`..`Tier 5` text.
- `region` is optional.

### B. **Columns labeled 'Tier 1'..'Tier 5'**
```
Tier 1,Tier 2,Tier 3,Tier 4,Tier 5
blade,,BengaliousIndian,haramcutie,ITZShoryaOp
DisabledSprint,,SecureSp1ke,SuckAtPojav,ItzZangetsu007
```
The app will scan the header row for titles containing `Tier 1`..`Tier 5` and read non-empty cells below each column.

---

## Customize
All UI lives in `src/App.jsx` and Tailwind styles in `src/index.css`. Tweak freely!
