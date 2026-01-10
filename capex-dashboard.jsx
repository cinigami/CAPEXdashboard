import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

const PETRONAS = {
  emerald: "#00B1A9",
  blue: "#20419A",
  yellow: "#FDB924",
  purple: "#763F98",
  lime: "#BFD730",
};
const BRAND_PALETTE = [PETRONAS.emerald, PETRONAS.blue, PETRONAS.yellow, PETRONAS.purple, PETRONAS.lime];

const SAMPLE_PROJECTS = [
  { title: "Ammonia Compressor Upgrade", wbs: "WBS-001", status: "On Track", capexStatus: "New", budget: 5000000, committed: 4200000, paid: 3900000, remaining: 300000, balance: 800000, overdue: 200000, accrue: 150000, remarks: "", milestone: "Q4 2025 - Final commissioning and handover to operations" },
  { title: "Urea Granulator Filters", wbs: "WBS-002", status: "Delayed", capexStatus: "On-Going", budget: 2500000, committed: 1800000, paid: 800000, remaining: 1000000, balance: 400000, overdue: 300000, accrue: 250000, remarks: "", milestone: "Q2 2025 - Equipment delivery and site preparation" },
  { title: "Utilities DCS Network", wbs: "WBS-003", status: "Risk", capexStatus: "On-Going", budget: 3200000, committed: 2700000, paid: 1100000, remaining: 1600000, balance: 500000, overdue: 300000, accrue: 180000, remarks: "", milestone: "Q3 2025 - System integration and FAT completion" },
  { title: "Cooling Tower Refurbishment", wbs: "WBS-004", status: "On Track", capexStatus: "Completed", budget: 1800000, committed: 1750000, paid: 1750000, remaining: 0, balance: 50000, overdue: 0, accrue: 0, remarks: "", milestone: "Completed - December 2024" },
  { title: "Instrument Air Dryer", wbs: "WBS-005", status: "On Track", capexStatus: "New", budget: 900000, committed: 600000, paid: 200000, remaining: 400000, balance: 300000, overdue: 100000, accrue: 80000, remarks: "", milestone: "Q1 2025 - Installation and loop testing" },
  { title: "Steam Turbine Overhaul", wbs: "WBS-006", status: "Delayed", capexStatus: "On-Going", budget: 4200000, committed: 3800000, paid: 2100000, remaining: 1700000, balance: 400000, overdue: 450000, accrue: 320000, remarks: "", milestone: "Q2 2025 - Major overhaul during plant turnaround" },
  { title: "Pump Station Upgrade", wbs: "WBS-007", status: "On Track", capexStatus: "New", budget: 1500000, committed: 1200000, paid: 600000, remaining: 600000, balance: 300000, overdue: 150000, accrue: 120000, remarks: "", milestone: "Q3 2025 - Pump replacement and piping modification" },
];

function pct(num, den) {
  if (!den || den <= 0) return 0;
  return Math.max(0, Math.min(100, (num / den) * 100));
}

function formatMYR(n) {
  return "RM " + Math.round(n).toLocaleString();
}

function cleanMilestone(text) {
  if (!text) return "-";
  let clean = String(text);
  // Remove strikethrough unicode characters (combining long stroke overlay)
  clean = clean.replace(/[\u0336\u0335\u0334\u0337\u0338]/g, "");
  // Remove HTML strikethrough tags
  clean = clean.replace(/<\/?s>/gi, "").replace(/<\/?strike>/gi, "").replace(/<\/?del>/gi, "");
  // Remove markdown strikethrough ~~text~~
  clean = clean.replace(/~~([^~]+)~~/g, "$1");
  // Remove any other HTML tags
  clean = clean.replace(/<[^>]*>/g, "");
  // Remove special formatting characters
  clean = clean.replace(/[̶]/g, ""); // combining long solidus overlay
  // Clean up extra whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  return clean || "-";
}

function utilColor(p) {
  if (p >= 90) return PETRONAS.emerald;
  if (p >= 60) return PETRONAS.yellow;
  return PETRONAS.blue;
}

export default function CapexDashboard() {
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [capexMetric, setCapexMetric] = useState("count");
  const [modal, setModal] = useState({ open: false, type: null }); // type: 'overdue' | 'pending' | 'balance' | 'accrual'
  const [hoveredProject, setHoveredProject] = useState(null);

  const projectsCalc = useMemo(() => projects.map(p => ({
    ...p,
    unpaid: Math.max(0, p.committed - p.paid),
    utilizationPct: pct(p.paid, p.budget),
    accrue: p.accrue || 0,
    remarks: p.remarks || "",
    milestone: cleanMilestone(p.milestone)
  })), [projects]);

  const filtered = useMemo(() => projectsCalc.filter(p => {
    const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === "ALL" || p.status === statusFilter;
    return matchQ && matchS;
  }), [projectsCalc, query, statusFilter]);

  const statusOptions = useMemo(() => {
    const s = new Set(["ALL"]);
    projectsCalc.forEach(p => s.add(p.status));
    return Array.from(s);
  }, [projectsCalc]);

  const totals = useMemo(() => {
    const a = filtered.reduce((acc, p) => ({
      budget: acc.budget + p.budget,
      committed: acc.committed + p.committed,
      paid: acc.paid + p.paid,
      remaining: acc.remaining + p.remaining,
      balance: acc.balance + p.balance,
      unpaid: acc.unpaid + p.unpaid,
      accrue: acc.accrue + (p.accrue || 0),
    }), { budget: 0, committed: 0, paid: 0, remaining: 0, balance: 0, unpaid: 0, accrue: 0 });
    return { ...a, utilPct: pct(a.paid, a.budget) };
  }, [filtered]);

  const overdueBars = useMemo(() => filtered.filter(p => p.overdue > 0).sort((a, b) => b.overdue - a.overdue).slice(0, 8).map(p => ({ name: p.title.slice(0, 18), Overdue: p.overdue })), [filtered]);
  const pendingBars = useMemo(() => filtered.filter(p => p.remaining > 0).sort((a, b) => b.remaining - a.remaining).slice(0, 8).map(p => ({ name: p.title.slice(0, 18), Pending: p.remaining })), [filtered]);
  const balanceBars = useMemo(() => filtered.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 8).map(p => ({ name: p.title.slice(0, 18), Balance: p.balance })), [filtered]);
  const accrualBars = useMemo(() => filtered.filter(p => p.accrue > 0).sort((a, b) => b.accrue - a.accrue).slice(0, 8).map(p => ({ name: p.title.slice(0, 18), Accrual: p.accrue })), [filtered]);

  // Full lists for modal
  const allOverdue = useMemo(() => filtered.filter(p => p.overdue > 0).sort((a, b) => b.overdue - a.overdue), [filtered]);
  const allPending = useMemo(() => filtered.filter(p => p.remaining > 0).sort((a, b) => b.remaining - a.remaining), [filtered]);
  const allBalance = useMemo(() => filtered.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance), [filtered]);
  const allAccrual = useMemo(() => filtered.filter(p => p.accrue > 0).sort((a, b) => b.accrue - a.accrue), [filtered]);

  const capexStatusData = useMemo(() => {
    const t = {};
    filtered.forEach(p => {
      const s = p.capexStatus || "Unknown";
      if (!t[s]) t[s] = { count: 0, budget: 0, utilized: 0, remaining: 0 };
      t[s].count++;
      t[s].budget += p.budget;
      t[s].utilized += p.paid;
      t[s].remaining += p.remaining;
    });
    return Object.entries(t).map(([status, v]) => ({ status, value: Math.round(v[capexMetric]) })).filter(r => r.value > 0);
  }, [filtered, capexMetric]);

  const statusBars = useMemo(() => {
    const t = {};
    filtered.forEach(p => {
      if (!t[p.status]) t[p.status] = { committed: 0, paid: 0 };
      t[p.status].committed += p.committed;
      t[p.status].paid += p.paid;
    });
    return Object.entries(t).map(([status, v]) => ({ status, Utilized: v.paid, PendingDec: Math.max(0, v.committed - v.paid) })).filter(d => d.Utilized + d.PendingDec > 0);
  }, [filtered]);

  const progressParts = [
    { name: "Utilized", value: totals.paid, color: PETRONAS.emerald },
    { name: "Accrual", value: totals.accrue, color: PETRONAS.purple },
    { name: "Payment Pending (Dec)", value: totals.remaining, color: PETRONAS.blue },
    { name: "Balance", value: totals.balance, color: PETRONAS.yellow },
  ];
  const progressTotal = progressParts.reduce((s, p) => s + p.value, 0);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
        const parsed = rows.slice(1).map(r => {
          const get = (col) => { let i = 0; for (let c of col) i = i * 26 + (c.charCodeAt(0) - 64); return r[i - 1]; };
          const num = (v) => parseFloat(String(v || 0).replace(/[^0-9.-]/g, "")) || 0;
          const txt = (v) => String(v || "").trim();
          const title = txt(get("C"));
          if (!title || title.toLowerCase().includes("capex")) return null;
          return { title, wbs: txt(get("D")), status: txt(get("AC")) || "Unknown", capexStatus: txt(get("B")) || "Unknown", budget: num(get("H")), committed: num(get("K")), paid: num(get("L")), remaining: num(get("N")), balance: num(get("P")), overdue: num(get("M")), accrue: num(get("O")), remarks: txt(get("AD")), milestone: cleanMilestone(get("Q")) };
        }).filter(Boolean);
        if (parsed.length) setProjects(parsed);
      } catch (err) { console.error(err); }
    };
    reader.readAsBinaryString(f);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-800">CAPEX Maintenance 2025 Dashboard</h1>
          <div className="flex gap-2">
            <label className="cursor-pointer rounded-lg border bg-white px-3 py-2 text-sm shadow hover:bg-gray-50">
              📤 Upload
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            </label>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <input type="text" placeholder="🔍 Search..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 min-w-[180px] rounded-lg border px-3 py-2 text-sm" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: "Total Budget", val: formatMYR(totals.budget) },
            { label: "YEP", val: formatMYR(totals.committed) },
            { label: "YTD", val: formatMYR(totals.paid) },
            { label: "Accrual", val: formatMYR(totals.accrue), color: PETRONAS.purple },
            { label: "Payment Pending (Dec)", val: formatMYR(totals.remaining) },
            { label: "Utilization", val: totals.utilPct.toFixed(1) + "%", color: utilColor(totals.utilPct) },
            { label: "Balance", val: formatMYR(totals.balance) },
          ].map(k => (
            <div key={k.label} className="rounded-xl border bg-white p-3 shadow">
              <div className="text-xs text-gray-500">{k.label}</div>
              <div className="text-lg font-bold" style={{ color: k.color || "#1f2937" }}>{k.val}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-xl border bg-white p-4 shadow">
          <div className="mb-2 text-sm font-medium">Total Progress</div>
          <div className="mb-1 flex text-xs text-gray-600">
            {progressParts.map(p => {
              const w = progressTotal > 0 ? (p.value / progressTotal) * 100 : 0;
              return <div key={p.name} style={{ width: w + "%" }} className="text-center">{w > 8 ? Math.round(w) + "%" : ""}</div>;
            })}
          </div>
          <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
            {progressParts.map(p => <div key={p.name} style={{ width: (progressTotal > 0 ? (p.value / progressTotal) * 100 : 0) + "%", backgroundColor: p.color }} />)}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            {progressParts.map(p => (
              <div key={p.name} className="flex items-center gap-1">
                <span className="h-3 w-3 rounded" style={{ backgroundColor: p.color }} />
                <span>{p.name}: {formatMYR(p.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-4 shadow">
            <div className="mb-2 text-sm font-medium cursor-pointer hover:text-blue-600 flex items-center justify-between" onClick={() => setModal({ open: true, type: 'overdue' })}>
              <span>Top Overdue</span>
              <span className="text-xs text-gray-400">({allOverdue.length}) →</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={overdueBars} layout="vertical" margin={{ left: 5, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => formatMYR(v)} />
                  <Bar dataKey="Overdue">{overdueBars.map((_, i) => <Cell key={i} fill={BRAND_PALETTE[i % 5]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow">
            <div className="mb-2 text-sm font-medium cursor-pointer hover:text-blue-600 flex items-center justify-between" onClick={() => setModal({ open: true, type: 'pending' })}>
              <span>Top Payment Pending (Dec)</span>
              <span className="text-xs text-gray-400">({allPending.length}) →</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={pendingBars} layout="vertical" margin={{ left: 5, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => formatMYR(v)} />
                  <Bar dataKey="Pending">{pendingBars.map((_, i) => <Cell key={i} fill={BRAND_PALETTE[i % 5]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow">
            <div className="mb-2 text-sm font-medium cursor-pointer hover:text-purple-600 flex items-center justify-between" onClick={() => setModal({ open: true, type: 'balance' })}>
              <span>Top Balance</span>
              <span className="text-xs text-gray-400">({allBalance.length}) →</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={balanceBars} layout="vertical" margin={{ left: 5, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => formatMYR(v)} />
                  <Bar dataKey="Balance">{balanceBars.map((_, i) => <Cell key={i} fill={BRAND_PALETTE[i % 5]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow">
            <div className="mb-2 text-sm font-medium cursor-pointer hover:text-purple-600 flex items-center justify-between" onClick={() => setModal({ open: true, type: 'accrual' })}>
              <span>Top Accrual</span>
              <span className="text-xs text-gray-400">({allAccrual.length}) →</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={accrualBars} layout="vertical" margin={{ left: 5, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => formatMYR(v)} />
                  <Bar dataKey="Accrual">{accrualBars.map((_, i) => <Cell key={i} fill={PETRONAS.purple} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">CAPEX Status</span>
              <select value={capexMetric} onChange={e => setCapexMetric(e.target.value)} className="rounded border px-2 py-1 text-xs">
                <option value="count">Count</option>
                <option value="budget">Budget</option>
                <option value="utilized">Utilized</option>
                <option value="remaining">Remaining</option>
              </select>
            </div>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={capexStatusData} layout="vertical" margin={{ left: 5, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => capexMetric === "count" ? v : (v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k")} />
                  <YAxis type="category" dataKey="status" width={70} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => capexMetric === "count" ? v + " projects" : formatMYR(v)} />
                  <Bar dataKey="value">{capexStatusData.map((_, i) => <Cell key={i} fill={BRAND_PALETTE[i % 5]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-xl border bg-white p-4 shadow">
          <div className="mb-2 text-sm font-medium">YEP by Status</div>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={statusBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                <Tooltip formatter={v => formatMYR(v)} />
                <Legend />
                <Bar dataKey="Utilized" stackId="a" fill={PETRONAS.emerald} />
                <Bar dataKey="PendingDec" name="Payment Pending (Dec)" stackId="a" fill={PETRONAS.blue} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-4 rounded-xl border bg-white p-4 shadow overflow-visible">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Project Utilization</span>
            <span className="text-xs text-gray-500">
              <span style={{ color: PETRONAS.emerald }}>≥90%</span> / <span style={{ color: PETRONAS.yellow }}>60-89%</span> / <span style={{ color: PETRONAS.blue }}>&lt;60%</span>
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">💡 <span>Hover on any project card to view Payment Milestone details (Cancelled & Completed projects excluded)</span></div>
          <div className="grid gap-3 md:grid-cols-2 overflow-visible">
            {[...filtered].filter(p => !p.remarks.toLowerCase().includes('cancelled') && !p.remarks.toLowerCase().includes('cancellation') && !p.remarks.toLowerCase().includes('completed')).sort((a, b) => a.utilizationPct - b.utilizationPct).map((p, i) => (
              <div 
                key={i} 
                className="rounded-lg border bg-gray-50 p-3 relative cursor-pointer transition-shadow hover:shadow-md"
                onMouseEnter={() => setHoveredProject(i)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="truncate text-sm font-medium">{p.title}</span>
                  <span className="text-xs font-bold" style={{ color: utilColor(p.utilizationPct) }}>{p.utilizationPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 mb-2">
                  <div className="h-2 rounded-full" style={{ width: Math.min(100, p.utilizationPct) + "%", backgroundColor: utilColor(p.utilizationPct) }} />
                </div>
                <div className="flex flex-wrap gap-x-3 text-xs text-gray-600">
                  <span>Budget: <b>{formatMYR(p.budget)}</b></span>
                  <span>Utilized: <b>{formatMYR(p.paid)}</b></span>
                  <span>Accrual: <b style={{ color: PETRONAS.purple }}>{formatMYR(p.accrue)}</b></span>
                  <span>Balance: <b>{formatMYR(p.balance)}</b></span>
                </div>
                
                {/* Tooltip for Payment Milestone */}
                {hoveredProject === i && p.milestone && (
                  <div className="absolute left-0 right-0 -top-3 -translate-y-full z-20">
                    <div className="bg-white border-2 border-gray-200 text-gray-800 rounded-xl p-4 shadow-xl mx-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📅</span>
                        <span className="font-bold text-sm" style={{ color: PETRONAS.blue }}>Payment Milestone</span>
                      </div>
                      <div className="text-sm leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                        {cleanMilestone(p.milestone)}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-gray-200 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow">
          <div className="mb-3 text-sm font-medium">Unpaid Details</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="p-2">Project</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Budget</th>
                  <th className="p-2 text-right">Committed</th>
                  <th className="p-2 text-right">Utilized</th>
                  <th className="p-2 text-right">Accrual</th>
                  <th className="p-2 text-right">Unpaid</th>
                </tr>
              </thead>
              <tbody>
                {filtered.filter(p => p.unpaid > 0).sort((a, b) => b.unpaid - a.unpaid).map((p, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2 truncate max-w-[160px]">{p.title}</td>
                    <td className="p-2">{p.status}</td>
                    <td className="p-2 text-right">{formatMYR(p.budget)}</td>
                    <td className="p-2 text-right">{formatMYR(p.committed)}</td>
                    <td className="p-2 text-right">{formatMYR(p.paid)}</td>
                    <td className="p-2 text-right" style={{ color: PETRONAS.purple }}>{formatMYR(p.accrue || 0)}</td>
                    <td className="p-2 text-right font-bold" style={{ color: PETRONAS.blue }}>{formatMYR(p.unpaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">Budget=H | Committed=K | Utilized=L | Remaining=N | Accrual=O | Balance=P | Milestone=Q | Status=AC | Remarks=AD</div>

        {/* Modal for full project lists */}
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal({ open: false, type: null })}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl shrink-0">
                <h2 className="text-lg font-bold text-gray-800">
                  {modal.type === 'overdue' && `All Overdue Projects (${allOverdue.length})`}
                  {modal.type === 'pending' && `All Payment Pending in Dec (${allPending.length})`}
                  {modal.type === 'balance' && `All Balance Projects (${allBalance.length})`}
                  {modal.type === 'accrual' && `All Accrual Projects (${allAccrual.length})`}
                </h2>
                <button onClick={() => setModal({ open: false, type: null })} className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200">×</button>
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white shadow-sm">
                    <tr className="border-b text-left text-gray-600 bg-gray-100">
                      <th className="p-2 rounded-tl">#</th>
                      <th className="p-2">Project</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">Budget</th>
                      {modal.type !== 'accrual' && <th className="p-2 text-right">Accrual</th>}
                      <th className="p-2 text-right rounded-tr">
                        {modal.type === 'overdue' && 'Overdue'}
                        {modal.type === 'pending' && 'Pending (Dec)'}
                        {modal.type === 'balance' && 'Balance'}
                        {modal.type === 'accrual' && 'Accrual'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(modal.type === 'overdue' ? allOverdue : modal.type === 'pending' ? allPending : modal.type === 'accrual' ? allAccrual : allBalance).map((p, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-gray-400">{i + 1}</td>
                        <td className="p-2 font-medium">{p.title}</td>
                        <td className="p-2">{p.status}</td>
                        <td className="p-2 text-right">{formatMYR(p.budget)}</td>
                        {modal.type !== 'accrual' && <td className="p-2 text-right" style={{ color: PETRONAS.purple }}>{formatMYR(p.accrue || 0)}</td>}
                        <td className="p-2 text-right font-bold" style={{ color: modal.type === 'accrual' ? PETRONAS.purple : PETRONAS.blue }}>
                          {modal.type === 'overdue' && formatMYR(p.overdue)}
                          {modal.type === 'pending' && formatMYR(p.remaining)}
                          {modal.type === 'balance' && formatMYR(p.balance)}
                          {modal.type === 'accrual' && formatMYR(p.accrue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t bg-gray-50 p-4 rounded-b-xl shrink-0">
                <div className="flex justify-between font-bold text-sm">
                  <span>Total: {(modal.type === 'overdue' ? allOverdue : modal.type === 'pending' ? allPending : modal.type === 'accrual' ? allAccrual : allBalance).length} projects</span>
                  <div className="flex gap-4">
                    <span>Budget: {formatMYR((modal.type === 'overdue' ? allOverdue : modal.type === 'pending' ? allPending : modal.type === 'accrual' ? allAccrual : allBalance).reduce((s, p) => s + p.budget, 0))}</span>
                    {modal.type !== 'accrual' && <span style={{ color: PETRONAS.purple }}>Accrual: {formatMYR((modal.type === 'overdue' ? allOverdue : modal.type === 'pending' ? allPending : allBalance).reduce((s, p) => s + (p.accrue || 0), 0))}</span>}
                    <span style={{ color: modal.type === 'accrual' ? PETRONAS.purple : PETRONAS.blue }}>
                      {modal.type === 'overdue' && `Overdue: ${formatMYR(allOverdue.reduce((s, p) => s + p.overdue, 0))}`}
                      {modal.type === 'pending' && `Pending (Dec): ${formatMYR(allPending.reduce((s, p) => s + p.remaining, 0))}`}
                      {modal.type === 'balance' && `Balance: ${formatMYR(allBalance.reduce((s, p) => s + p.balance, 0))}`}
                      {modal.type === 'accrual' && `Accrual: ${formatMYR(allAccrual.reduce((s, p) => s + (p.accrue || 0), 0))}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
