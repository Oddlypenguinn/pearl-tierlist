import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

const SHEET_URL = import.meta.env.VITE_SHEET_CSV || "YOUR_CSV_LINK_HERE";

function classNames(...xs){ return xs.filter(Boolean).join(" "); }

function Header({onSearch}){
  return (
    <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center font-bold">PT</div>
        <h1 className="text-xl font-semibold tracking-wide">Pearl Tierlist</h1>
        <div className="flex-1" />
        <input
          onChange={(e)=>onSearch(e.target.value)}
          placeholder="Search player..."
          className="w-64 max-w-[60vw] px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 outline-none focus:ring-2 ring-brand-600"
        />
        <a
          href={SHEET_URL !== "YOUR_CSV_LINK_HERE" ? SHEET_URL : "#"}
          target="_blank"
          className="text-sm px-3 py-2 rounded-xl border border-gray-700 hover:bg-gray-900"
          rel="noreferrer"
        >
          View CSV
        </a>
      </div>
    </header>
  );
}

function TierCard({tier, players}){
  const colors = {
    1: "from-yellow-500/20 to-yellow-700/10",
    2: "from-cyan-500/20 to-cyan-700/10",
    3: "from-orange-500/20 to-orange-700/10",
    4: "from-indigo-500/20 to-indigo-700/10",
    5: "from-pink-500/20 to-pink-700/10",
  };
  return (
    <section className={classNames(
      "rounded-2xl border border-gray-800 bg-gradient-to-br p-4",
      colors[tier] || "from-gray-700/10 to-gray-800/10"
    )}>
      <h2 className="text-2xl font-semibold mb-3">Tier {tier}</h2>
      {players.length === 0 ? (
        <p className="text-gray-400">No players yet</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {players.map((p, idx) => (
            <li key={idx} className="rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 flex items-center justify-between">
              <span className="truncate">{p.name}</span>
              {p.region && <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 border border-gray-700">{p.region}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function normalizeCell(x){
  if (typeof x !== "string") return "";
  return x.trim();
}

function parseCSVToTiers(csvText){
  const { data } = Papa.parse(csvText.trim());
  if (!data || data.length === 0) return {1:[],2:[],3:[],4:[],5:[]};

  // Detect header style
  const header = data[0].map(normalizeCell);

  const hasTierColumns = header.some(h => /^tier\s*1/i.test(h)) ||
                         header.some(h => /^tier\s*2/i.test(h));

  const tiers = {1:[],2:[],3:[],4:[],5:[]};

  if (hasTierColumns){
    // Find index of Tier N columns
    const idx = {};
    for (let n=1;n<=5;n++){
      idx[n] = header.findIndex(h => new RegExp(`^tier\\s*${n}$`, "i").test(h));
    }
    // For each row, collect non-empty cells under each tier column
    for (let r=1; r<data.length; r++){
      const row = data[r];
      for (let n=1;n<=5;n++){
        const name = normalizeCell(row[idx[n]]);
        if (name) tiers[n].push({ name });
      }
    }
  } else {
    // Expect columns: tier, player, (optional) region
    // Try to find columns by name, fallback to first 2 columns
    const ti = header.findIndex(h => /^tier/i.test(h));
    const pi = header.findIndex(h => /^(player|name)$/i.test(h));
    const ri = header.findIndex(h => /^region$/i.test(h));
    const tierIdx = ti >= 0 ? ti : 0;
    const playerIdx = pi >= 0 ? pi : 1;
    const regionIdx = ri >= 0 ? ri : 2;

    for (let r=1; r<data.length; r++){
      const row = data[r];
      const tCell = normalizeCell(row[tierIdx]);
      const pCell = normalizeCell(row[playerIdx]);
      const reg = normalizeCell(row[regionIdx]);
      if (!pCell) continue;
      const m = tCell.match(/(\d+)/);
      const n = m ? parseInt(m[1],10) : null;
      if (n && n>=1 && n<=5){
        tiers[n].push({ name: pCell, region: reg || undefined });
      }
    }
  }

  return tiers;
}

export default function App(){
  const [tiers, setTiers] = useState({1:[],2:[],3:[],4:[],5:[]});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    async function load(){
      try{
        const res = await fetch(SHEET_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const t = parseCSVToTiers(text);
        setTiers(t);
      }catch(e){
        setError("Could not load sheet. Set VITE_SHEET_CSV or replace YOUR_CSV_LINK_HERE.");
        console.error(e);
      }finally{
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tiers;
    const out = {1:[],2:[],3:[],4:[],5:[]};
    for (let n=1;n<=5;n++){
      out[n] = tiers[n].filter(p => p.name.toLowerCase().includes(qq));
    }
    return out;
  }, [q, tiers]);

  return (
    <div className="min-h-screen">
      <Header onSearch={setQ} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {loading && <div className="text-gray-400">Loading…</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5].map(n => (
              <TierCard key={n} tier={n} players={filtered[n]} />
            ))}
          </div>
        )}
        <footer className="pt-8 text-sm text-gray-500">
          <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
            <span>Auto-updating from Google Sheets</span>
            <span>Made for you ✦</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
