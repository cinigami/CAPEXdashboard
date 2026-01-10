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
  PieChart,
  Pie,
} from "recharts";

const PETRONAS = {
  emerald: "#00B1A9",
  blue: "#20419A",
  yellow: "#FDB924",
  purple: "#763F98",
  lime: "#BFD730",
  red: "#E63946",
  gray: "#6B7280",
};
const BRAND_PALETTE = [PETRONAS.emerald, PETRONAS.blue, PETRONAS.yellow, PETRONAS.purple, PETRONAS.lime];

// Sample data matching Excel structure
const SAMPLE_DEPARTMENT = {
  name: "Maintenance & Reliability",
  costCenter: "PCFK-MR-001",
  totalBudget: 15000000,
  fiscalYear: 2025,
  departmentHead: "Department Head Name",
  budgetController: "Budget Controller Name",
  currency: "MYR",
  lastUpdated: "2026-01-07",
};

const SAMPLE_PROJECTS = [
  { id: "PRJ-001", name: "Ammonia Compressor Overhaul", costCenter: "PCFK-AMM-001", originalBudget: 3500000, contractValue: 3200000, transferIn: 200000, transferOut: 0, currentBudget: 3700000, startDate: "2025-01-01", endDate: "2025-06-30", projectManager: "Ahmad Razak", vendor: "Vendor A Sdn Bhd", paymentTerms: "Net 30", status: "Active", priority: "High" },
  { id: "PRJ-002", name: "Urea Prilling Tower Upgrade", costCenter: "PCFK-URE-002", originalBudget: 2800000, contractValue: 2500000, transferIn: 50000, transferOut: 0, currentBudget: 2850000, startDate: "2025-02-01", endDate: "2025-08-31", projectManager: "Siti Aminah", vendor: "Vendor B Sdn Bhd", paymentTerms: "Net 45", status: "Active", priority: "High" },
  { id: "PRJ-003", name: "DCS Migration Phase 1", costCenter: "PCFK-INS-003", originalBudget: 4200000, contractValue: 4000000, transferIn: 150000, transferOut: 0, currentBudget: 4350000, startDate: "2025-03-01", endDate: "2025-12-31", projectManager: "Lee Wei Ming", vendor: "Vendor C Sdn Bhd", paymentTerms: "Milestone", status: "Active", priority: "Critical" },
  { id: "PRJ-004", name: "Cooling Tower Refurbishment", costCenter: "PCFK-UTL-004", originalBudget: 1800000, contractValue: 1650000, transferIn: 0, transferOut: 350000, currentBudget: 1450000, startDate: "2025-04-01", endDate: "2025-09-30", projectManager: "Muthu Rajan", vendor: "Vendor D Sdn Bhd", paymentTerms: "Net 30", status: "Planning", priority: "Medium" },
  { id: "PRJ-005", name: "Safety Valve Replacement", costCenter: "PCFK-MNT-005", originalBudget: 950000, contractValue: 900000, transferIn: 0, transferOut: 50000, currentBudget: 900000, startDate: "2025-05-01", endDate: "2025-07-31", projectManager: "Farah Nadia", vendor: "Vendor E Sdn Bhd", paymentTerms: "Net 30", status: "Active", priority: "High" },
];

const SAMPLE_TRANSFERS = [
  { id: "TRF-001", date: "2025-03-15", fromProject: "PRJ-004", toProject: "PRJ-001", reason: "Additional compressor parts required", amount: 200000, approvedBy: "Department Head", approvalDate: "2025-03-16", status: "Approved" },
  { id: "TRF-002", date: "2025-04-20", fromProject: "PRJ-004", toProject: "PRJ-003", reason: "DCS scope expansion", amount: 150000, approvedBy: "Department Head", approvalDate: "2025-04-22", status: "Approved" },
  { id: "TRF-003", date: "2025-05-10", fromProject: "PRJ-005", toProject: "PRJ-002", reason: "Prilling tower additional works", amount: 50000, approvedBy: "Budget Controller", approvalDate: "2025-05-12", status: "Approved" },
];

const SAMPLE_PLAN_UTILIZATION = [
  { entryNo: 1, projectId: "PRJ-001", date: "2025-01-15", description: "Compressor parts procurement", plannedAmount: 800000 },
  { entryNo: 2, projectId: "PRJ-001", date: "2025-02-15", description: "Installation Phase 1", plannedAmount: 400000 },
  { entryNo: 3, projectId: "PRJ-002", date: "2025-02-20", description: "Prilling equipment order", plannedAmount: 750000 },
  { entryNo: 4, projectId: "PRJ-003", date: "2025-03-15", description: "DCS hardware procurement", plannedAmount: 1200000 },
  { entryNo: 5, projectId: "PRJ-001", date: "2025-03-20", description: "Compressor parts - Phase 2", plannedAmount: 600000 },
  { entryNo: 6, projectId: "PRJ-003", date: "2025-04-15", description: "Software licenses", plannedAmount: 500000 },
  { entryNo: 7, projectId: "PRJ-005", date: "2025-05-10", description: "Safety valve procurement", plannedAmount: 350000 },
];

const SAMPLE_MILESTONES = [
  { projectId: "PRJ-001", milestoneId: "MS-001-01", description: "Mobilization", percentage: 0.10, plannedDate: "2025-01-15", actualDate: "2025-01-20", status: "Paid" },
  { projectId: "PRJ-001", milestoneId: "MS-001-02", description: "Equipment Delivery", percentage: 0.30, plannedDate: "2025-02-28", actualDate: "2025-03-05", status: "Paid" },
  { projectId: "PRJ-001", milestoneId: "MS-001-03", description: "Installation Complete", percentage: 0.40, plannedDate: "2025-05-15", actualDate: null, status: "Not Completed" },
  { projectId: "PRJ-001", milestoneId: "MS-001-04", description: "Commissioning & Handover", percentage: 0.20, plannedDate: "2025-06-30", actualDate: null, status: "Not Completed" },
  { projectId: "PRJ-002", milestoneId: "MS-002-01", description: "Engineering Approval", percentage: 0.15, plannedDate: "2025-03-15", actualDate: "2025-03-20", status: "Paid" },
  { projectId: "PRJ-002", milestoneId: "MS-002-02", description: "Equipment Delivery", percentage: 0.35, plannedDate: "2025-05-31", actualDate: null, status: "Not Completed" },
  { projectId: "PRJ-003", milestoneId: "MS-003-01", description: "Design Approval", percentage: 0.10, plannedDate: "2025-04-30", actualDate: "2025-05-05", status: "Paid" },
  { projectId: "PRJ-005", milestoneId: "MS-005-01", description: "Valve Delivery", percentage: 0.40, plannedDate: "2025-05-31", actualDate: "2025-06-05", status: "Paid" },
];

const SAMPLE_ACTUAL_PAYMENTS = [
  { paymentNo: 1, projectId: "PRJ-001", milestoneId: "MS-001-01", paymentDate: "2025-01-20", invoiceNo: "INV-001-001", invoiceAmount: 320000, amountPaid: 320000, status: "Fully Paid" },
  { paymentNo: 2, projectId: "PRJ-001", milestoneId: "MS-001-02", paymentDate: "2025-03-05", invoiceNo: "INV-001-002", invoiceAmount: 960000, amountPaid: 960000, status: "Fully Paid" },
  { paymentNo: 3, projectId: "PRJ-002", milestoneId: "MS-002-01", paymentDate: "2025-03-20", invoiceNo: "INV-002-001", invoiceAmount: 375000, amountPaid: 375000, status: "Fully Paid" },
  { paymentNo: 4, projectId: "PRJ-003", milestoneId: "MS-003-01", paymentDate: "2025-05-05", invoiceNo: "INV-003-001", invoiceAmount: 400000, amountPaid: 400000, status: "Fully Paid" },
  { paymentNo: 5, projectId: "PRJ-005", milestoneId: "MS-005-01", paymentDate: "2025-06-05", invoiceNo: "INV-005-001", invoiceAmount: 360000, amountPaid: 360000, status: "Fully Paid" },
];

function formatMYR(n) {
  if (n === null || n === undefined) return "-";
  return "RM " + Math.round(n).toLocaleString();
}

function formatPct(n) {
  if (n === null || n === undefined) return "-";
  return (n * 100).toFixed(1) + "%";
}

function formatDate(d) {
  if (!d) return "-";
  if (typeof d === "string") return d.split("T")[0];
  return d.toISOString().split("T")[0];
}

function getStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "approved" || s === "paid" || s === "fully paid" || s === "healthy") return PETRONAS.emerald;
  if (s === "planning" || s === "pending" || s === "partial" || s === "caution") return PETRONAS.yellow;
  if (s === "critical" || s === "overrun" || s === "rejected" || s === "overdue") return PETRONAS.red;
  if (s === "completed" || s === "not completed") return PETRONAS.blue;
  return PETRONAS.gray;
}

function getPriorityColor(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "critical") return PETRONAS.red;
  if (p === "high") return PETRONAS.yellow;
  if (p === "medium") return PETRONAS.blue;
  return PETRONAS.gray;
}

export default function CapexDashboard() {
  const [department, setDepartment] = useState(SAMPLE_DEPARTMENT);
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [transfers, setTransfers] = useState(SAMPLE_TRANSFERS);
  const [planUtilization, setPlanUtilization] = useState(SAMPLE_PLAN_UTILIZATION);
  const [milestones, setMilestones] = useState(SAMPLE_MILESTONES);
  const [actualPayments, setActualPayments] = useState(SAMPLE_ACTUAL_PAYMENTS);

  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  // Calculate totals
  const totals = useMemo(() => {
    const originalBudget = projects.reduce((s, p) => s + (p.originalBudget || 0), 0);
    const transferIn = projects.reduce((s, p) => s + (p.transferIn || 0), 0);
    const transferOut = projects.reduce((s, p) => s + (p.transferOut || 0), 0);
    const currentBudget = projects.reduce((s, p) => s + (p.currentBudget || 0), 0);
    const contractValue = projects.reduce((s, p) => s + (p.contractValue || 0), 0);
    const planTotal = planUtilization.reduce((s, p) => s + (p.plannedAmount || 0), 0);
    const actualTotal = actualPayments.reduce((s, p) => s + (p.amountPaid || 0), 0);
    const outstanding = contractValue - actualTotal;

    return {
      originalBudget,
      transferIn,
      transferOut,
      netTransfer: transferIn - transferOut,
      currentBudget,
      contractValue,
      planTotal,
      actualTotal,
      outstanding,
      planUtilPct: currentBudget > 0 ? planTotal / currentBudget : 0,
      actualUtilPct: currentBudget > 0 ? actualTotal / currentBudget : 0,
      paymentPct: contractValue > 0 ? actualTotal / contractValue : 0,
      budgetVariance: currentBudget - planTotal,
    };
  }, [projects, planUtilization, actualPayments]);

  // Filter projects
  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === "ALL" || p.status === statusFilter;
    const matchP = priorityFilter === "ALL" || p.priority === priorityFilter;
    return matchQ && matchS && matchP;
  }), [projects, query, statusFilter, priorityFilter]);

  // Status options
  const statusOptions = useMemo(() => {
    const s = new Set(["ALL"]);
    projects.forEach(p => s.add(p.status));
    return Array.from(s);
  }, [projects]);

  const priorityOptions = useMemo(() => {
    const s = new Set(["ALL"]);
    projects.forEach(p => s.add(p.priority));
    return Array.from(s);
  }, [projects]);

  // Chart data
  const projectBudgetData = useMemo(() =>
    filteredProjects.map(p => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name,
      "Original Budget": p.originalBudget,
      "Current Budget": p.currentBudget,
      "Contract Value": p.contractValue,
    }))
  , [filteredProjects]);

  const utilizationByProject = useMemo(() => {
    const projectPlans = {};
    const projectActuals = {};

    planUtilization.forEach(p => {
      projectPlans[p.projectId] = (projectPlans[p.projectId] || 0) + p.plannedAmount;
    });
    actualPayments.forEach(p => {
      projectActuals[p.projectId] = (projectActuals[p.projectId] || 0) + p.amountPaid;
    });

    return filteredProjects.map(p => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
      "Planned": projectPlans[p.id] || 0,
      "Actual": projectActuals[p.id] || 0,
      "Budget": p.currentBudget,
    }));
  }, [filteredProjects, planUtilization, actualPayments]);

  const statusDistribution = useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ name: status, value: count }));
  }, [projects]);

  const priorityDistribution = useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      counts[p.priority] = (counts[p.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([priority, value]) => ({ name: priority, value }));
  }, [projects]);

  const milestoneProgress = useMemo(() => {
    const byProject = {};
    milestones.forEach(m => {
      if (!byProject[m.projectId]) byProject[m.projectId] = { total: 0, completed: 0, paid: 0 };
      byProject[m.projectId].total++;
      if (m.status === "Paid") byProject[m.projectId].paid++;
      else if (m.actualDate) byProject[m.projectId].completed++;
    });
    return filteredProjects.map(p => {
      const data = byProject[p.id] || { total: 0, completed: 0, paid: 0 };
      return {
        name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
        "Paid": data.paid,
        "Completed": data.completed,
        "Pending": data.total - data.paid - data.completed,
      };
    }).filter(d => d.Paid + d.Completed + d.Pending > 0);
  }, [filteredProjects, milestones]);

  // Excel file handler
  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });

        // Parse Department_Info
        if (wb.SheetNames.includes("Department_Info")) {
          const ws = wb.Sheets["Department_Info"];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const info = {};
          rows.slice(1).forEach(r => {
            if (r[0] && r[1]) info[r[0]] = r[1];
          });
          setDepartment({
            name: info["Department Name"] || "",
            costCenter: info["Cost Center"] || "",
            totalBudget: parseFloat(info["Total CAPEX Budget"]) || 0,
            fiscalYear: info["Fiscal Year"] || "",
            departmentHead: info["Department Head"] || "",
            budgetController: info["Budget Controller"] || "",
            currency: info["Currency"] || "MYR",
            lastUpdated: info["Last Updated"] ? formatDate(info["Last Updated"]) : "",
          });
        }

        // Parse Project_Master
        if (wb.SheetNames.includes("Project_Master")) {
          const ws = wb.Sheets["Project_Master"];
          const rows = XLSX.utils.sheet_to_json(ws);
          const parsed = rows.filter(r => r["Project ID"] && !String(r["Project ID"]).includes("TOTAL")).map(r => ({
            id: r["Project ID"],
            name: r["Project Name"],
            costCenter: r["Cost Center"],
            originalBudget: parseFloat(r["Original Budget"]) || 0,
            contractValue: parseFloat(r["Contract Value"]) || 0,
            transferIn: parseFloat(r["Budget Transfer In"]) || 0,
            transferOut: parseFloat(r["Budget Transfer Out"]) || 0,
            currentBudget: parseFloat(r["Current Budget"]) || 0,
            startDate: r["Start Date"] ? formatDate(r["Start Date"]) : "",
            endDate: r["End Date"] ? formatDate(r["End Date"]) : "",
            projectManager: r["Project Manager"] || "",
            vendor: r["Vendor/Contractor"] || "",
            paymentTerms: r["Payment Terms"] || "",
            status: r["Project Status"] || "Unknown",
            priority: r["Priority"] || "Medium",
            remarks: r["Remarks"] || "",
          }));
          if (parsed.length) setProjects(parsed);
        }

        // Parse Budget_Transfers
        if (wb.SheetNames.includes("Budget_Transfers")) {
          const ws = wb.Sheets["Budget_Transfers"];
          const rows = XLSX.utils.sheet_to_json(ws);
          const parsed = rows.filter(r => r["Transfer ID"] && !String(r["Transfer ID"]).includes("SUMMARY")).map(r => ({
            id: r["Transfer ID"],
            date: r["Transfer Date"] ? formatDate(r["Transfer Date"]) : "",
            fromProject: r["From Project"],
            toProject: r["To Project"],
            reason: r["Reason/Justification"] || "",
            amount: parseFloat(r["Amount"]) || 0,
            approvedBy: r["Approved By"] || "",
            approvalDate: r["Approval Date"] ? formatDate(r["Approval Date"]) : "",
            status: r["Transfer Status"] || "Pending",
            remarks: r["Remarks"] || "",
          }));
          setTransfers(parsed);
        }

        // Parse Plan_Utilization
        if (wb.SheetNames.includes("Plan_Utilization")) {
          const ws = wb.Sheets["Plan_Utilization"];
          const rows = XLSX.utils.sheet_to_json(ws);
          const parsed = rows.filter(r => r["Entry No"]).map(r => ({
            entryNo: r["Entry No"],
            projectId: r["Project ID"],
            date: r["Date"] ? formatDate(r["Date"]) : "",
            description: r["Description"] || "",
            plannedAmount: parseFloat(r["Planned Amount"]) || 0,
          }));
          if (parsed.length) setPlanUtilization(parsed);
        }

        // Parse Payment_Milestones
        if (wb.SheetNames.includes("Payment_Milestones")) {
          const ws = wb.Sheets["Payment_Milestones"];
          const rows = XLSX.utils.sheet_to_json(ws);
          const parsed = rows.filter(r => r["Project ID"] && r["Milestone ID"]).map(r => ({
            projectId: r["Project ID"],
            milestoneId: r["Milestone ID"],
            description: r["Milestone Description"] || "",
            percentage: parseFloat(r["Milestone %"]) || 0,
            plannedDate: r["Planned Date"] ? formatDate(r["Planned Date"]) : "",
            actualDate: r["Actual Date"] ? formatDate(r["Actual Date"]) : null,
            status: r["Milestone Status"] || "Not Completed",
          }));
          if (parsed.length) setMilestones(parsed);
        }

        // Parse Actual_Utilization
        if (wb.SheetNames.includes("Actual_Utilization")) {
          const ws = wb.Sheets["Actual_Utilization"];
          const rows = XLSX.utils.sheet_to_json(ws);
          const parsed = rows.filter(r => r["Payment No"]).map(r => ({
            paymentNo: r["Payment No"],
            projectId: r["Project ID"],
            milestoneId: r["Milestone ID"],
            paymentDate: r["Payment Date"] ? formatDate(r["Payment Date"]) : "",
            invoiceNo: r["Invoice Number"] || "",
            invoiceAmount: parseFloat(r["Invoice Amount"]) || 0,
            amountPaid: parseFloat(r["Amount Paid"]) || 0,
            status: r["Payment Status"] || "Pending",
            remarks: r["Remarks"] || "",
          }));
          if (parsed.length) setActualPayments(parsed);
        }
      } catch (err) {
        console.error("Error parsing Excel:", err);
      }
    };
    reader.readAsBinaryString(f);
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "transfers", label: "Budget Transfers" },
    { id: "utilization", label: "Utilization" },
    { id: "milestones", label: "Milestones" },
    { id: "payments", label: "Payments" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl p-4 shadow">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Maintenance CAPEX Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Last Updated: {department.lastUpdated}</span>
            <label className="cursor-pointer rounded-lg border bg-gray-50 px-4 py-2 text-sm font-medium shadow hover:bg-gray-100 transition">
              Upload Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-1 bg-white rounded-xl p-1 shadow">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              style={activeTab === tab.id ? { backgroundColor: PETRONAS.emerald } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Key Financial Metrics */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Original Budget", val: formatMYR(totals.originalBudget), color: PETRONAS.gray },
                { label: "Budget Transfers", val: formatMYR(totals.netTransfer), color: totals.netTransfer >= 0 ? PETRONAS.emerald : PETRONAS.red },
                { label: "Current Budget", val: formatMYR(totals.currentBudget), color: PETRONAS.blue },
                { label: "Plan Utilization", val: formatMYR(totals.planTotal), sub: formatPct(totals.planUtilPct), color: PETRONAS.purple },
                { label: "Actual Paid", val: formatMYR(totals.actualTotal), sub: formatPct(totals.actualUtilPct), color: PETRONAS.emerald },
                { label: "Outstanding", val: formatMYR(totals.outstanding), color: PETRONAS.yellow },
              ].map(k => (
                <div key={k.label} className="rounded-xl border bg-white p-4 shadow">
                  <div className="text-xs text-gray-500 mb-1">{k.label}</div>
                  <div className="text-lg font-bold" style={{ color: k.color }}>{k.val}</div>
                  {k.sub && <div className="text-xs text-gray-400">{k.sub}</div>}
                </div>
              ))}
            </div>

            {/* Progress Bars */}
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Plan vs Actual Utilization</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Plan Utilization</span>
                      <span>{formatPct(totals.planUtilPct)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200">
                      <div className="h-3 rounded-full" style={{ width: Math.min(100, totals.planUtilPct * 100) + "%", backgroundColor: PETRONAS.purple }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Actual Utilization</span>
                      <span>{formatPct(totals.actualUtilPct)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200">
                      <div className="h-3 rounded-full" style={{ width: Math.min(100, totals.actualUtilPct * 100) + "%", backgroundColor: PETRONAS.emerald }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Payment Completion</span>
                      <span>{formatPct(totals.paymentPct)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200">
                      <div className="h-3 rounded-full" style={{ width: Math.min(100, totals.paymentPct * 100) + "%", backgroundColor: PETRONAS.blue }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Project Status Distribution</div>
                <div className="h-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                        {statusDistribution.map((entry, i) => (
                          <Cell key={i} fill={getStatusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Budget by Project</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={projectBudgetData} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={v => formatMYR(v)} />
                      <Legend />
                      <Bar dataKey="Original Budget" fill={PETRONAS.gray} />
                      <Bar dataKey="Current Budget" fill={PETRONAS.blue} />
                      <Bar dataKey="Contract Value" fill={PETRONAS.emerald} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Plan vs Actual by Project</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={utilizationByProject} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={v => formatMYR(v)} />
                      <Legend />
                      <Bar dataKey="Planned" fill={PETRONAS.purple} />
                      <Bar dataKey="Actual" fill={PETRONAS.emerald} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="rounded-xl border bg-white p-4 shadow">
              <div className="text-sm font-medium mb-3">Milestone Progress by Project</div>
              <div className="h-48">
                <ResponsiveContainer>
                  <BarChart data={milestoneProgress} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Paid" stackId="a" fill={PETRONAS.emerald} />
                    <Bar dataKey="Completed" stackId="a" fill={PETRONAS.yellow} />
                    <Bar dataKey="Pending" stackId="a" fill={PETRONAS.gray} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <>
            <div className="mb-4 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search projects..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 min-w-[180px] rounded-lg border px-3 py-2 text-sm"
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                {statusOptions.map(s => <option key={s} value={s}>{s === "ALL" ? "All Status" : s}</option>)}
              </select>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                {priorityOptions.map(s => <option key={s} value={s}>{s === "ALL" ? "All Priority" : s}</option>)}
              </select>
            </div>

            <div className="rounded-xl border bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      <th className="p-3">Project ID</th>
                      <th className="p-3">Project Name</th>
                      <th className="p-3 text-right">Original Budget</th>
                      <th className="p-3 text-right">Current Budget</th>
                      <th className="p-3 text-right">Contract Value</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Project Manager</th>
                      <th className="p-3">End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{p.id}</td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-right">{formatMYR(p.originalBudget)}</td>
                        <td className="p-3 text-right font-medium" style={{ color: PETRONAS.blue }}>{formatMYR(p.currentBudget)}</td>
                        <td className="p-3 text-right">{formatMYR(p.contractValue)}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getStatusColor(p.status) }}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-xs font-medium" style={{ color: getPriorityColor(p.priority) }}>
                            {p.priority}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{p.projectManager}</td>
                        <td className="p-3 text-gray-600">{p.endDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Budget Transfers Tab */}
        {activeTab === "transfers" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Total Transfers</div>
                <div className="text-lg font-bold">{transfers.length}</div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Approved Amount</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.emerald }}>
                  {formatMYR(transfers.filter(t => t.status === "Approved").reduce((s, t) => s + t.amount, 0))}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Pending Amount</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.yellow }}>
                  {formatMYR(transfers.filter(t => t.status === "Pending").reduce((s, t) => s + t.amount, 0))}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Projects Received Budget</div>
                <div className="text-lg font-bold">{new Set(transfers.map(t => t.toProject)).size}</div>
              </div>
            </div>

            <div className="rounded-xl border bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      <th className="p-3">Transfer ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">From Project</th>
                      <th className="p-3">To Project</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Approved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{t.id}</td>
                        <td className="p-3">{t.date}</td>
                        <td className="p-3 font-mono text-xs">{t.fromProject}</td>
                        <td className="p-3 font-mono text-xs">{t.toProject}</td>
                        <td className="p-3 text-right font-medium" style={{ color: PETRONAS.blue }}>{formatMYR(t.amount)}</td>
                        <td className="p-3 text-gray-600 max-w-[200px] truncate">{t.reason}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getStatusColor(t.status) }}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{t.approvedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Utilization Tab */}
        {activeTab === "utilization" && (
          <>
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Plan Utilization Summary</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Total Planned</div>
                    <div className="text-lg font-bold" style={{ color: PETRONAS.purple }}>{formatMYR(totals.planTotal)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Budget Variance</div>
                    <div className="text-lg font-bold" style={{ color: totals.budgetVariance >= 0 ? PETRONAS.emerald : PETRONAS.red }}>
                      {formatMYR(totals.budgetVariance)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Actual Utilization Summary</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Total Paid</div>
                    <div className="text-lg font-bold" style={{ color: PETRONAS.emerald }}>{formatMYR(totals.actualTotal)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Outstanding</div>
                    <div className="text-lg font-bold" style={{ color: PETRONAS.yellow }}>{formatMYR(totals.outstanding)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white shadow overflow-hidden mb-4">
              <div className="p-4 border-b bg-gray-50">
                <div className="text-sm font-medium">Plan Utilization Entries</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      <th className="p-3">#</th>
                      <th className="p-3">Project ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Planned Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planUtilization.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-400">{p.entryNo}</td>
                        <td className="p-3 font-mono text-xs">{p.projectId}</td>
                        <td className="p-3">{p.date}</td>
                        <td className="p-3">{p.description}</td>
                        <td className="p-3 text-right font-medium" style={{ color: PETRONAS.purple }}>{formatMYR(p.plannedAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan="4" className="p-3 text-right">Total:</td>
                      <td className="p-3 text-right" style={{ color: PETRONAS.purple }}>{formatMYR(totals.planTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Milestones Tab */}
        {activeTab === "milestones" && (
          <div className="rounded-xl border bg-white shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-600">
                    <th className="p-3">Project ID</th>
                    <th className="p-3">Milestone ID</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">%</th>
                    <th className="p-3">Planned Date</th>
                    <th className="p-3">Actual Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{m.projectId}</td>
                      <td className="p-3 font-mono text-xs">{m.milestoneId}</td>
                      <td className="p-3">{m.description}</td>
                      <td className="p-3 text-right">{formatPct(m.percentage)}</td>
                      <td className="p-3">{m.plannedDate}</td>
                      <td className="p-3">{m.actualDate || "-"}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getStatusColor(m.status) }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Total Payments</div>
                <div className="text-lg font-bold">{actualPayments.length}</div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Total Amount Paid</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.emerald }}>{formatMYR(totals.actualTotal)}</div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Contract Value</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.blue }}>{formatMYR(totals.contractValue)}</div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Payment Completion</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.emerald }}>{formatPct(totals.paymentPct)}</div>
              </div>
            </div>

            <div className="rounded-xl border bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      <th className="p-3">#</th>
                      <th className="p-3">Project ID</th>
                      <th className="p-3">Milestone ID</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3 text-right">Invoice Amount</th>
                      <th className="p-3 text-right">Amount Paid</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actualPayments.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-400">{p.paymentNo}</td>
                        <td className="p-3 font-mono text-xs">{p.projectId}</td>
                        <td className="p-3 font-mono text-xs">{p.milestoneId}</td>
                        <td className="p-3">{p.paymentDate}</td>
                        <td className="p-3">{p.invoiceNo}</td>
                        <td className="p-3 text-right">{formatMYR(p.invoiceAmount)}</td>
                        <td className="p-3 text-right font-medium" style={{ color: PETRONAS.emerald }}>{formatMYR(p.amountPaid)}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getStatusColor(p.status) }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan="6" className="p-3 text-right">Total:</td>
                      <td className="p-3 text-right" style={{ color: PETRONAS.emerald }}>{formatMYR(totals.actualTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-400">
          Department: {department.name} | Budget Controller: {department.budgetController} | Currency: {department.currency}
        </div>
      </div>
    </div>
  );
}
