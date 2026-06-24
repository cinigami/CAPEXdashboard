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

const SAMPLE_DEPARTMENT = {
  name: "Maintenance & Reliability",
  costCenter: "PCFK-MR-001",
  totalBudget: 100482088,
  fiscalYear: 2026,
  departmentHead: "M Fairoz B A Kahar",
  budgetController: "Siti Khadhijah Zulkafli",
  currency: "MYR",
  lastUpdated: new Date().toISOString().split("T")[0],
};

const SAMPLE_PROJECTS = [
  { id: "PRJ-001", name: "ABB LV Switchboard Retrofit", wbs: "P.220080001.03.0303", projectManager: "Suhaimi Samijan", discipline: "Electrical", originalBudget: 426665, plannedUtil: 885.6, transferIn: 0, transferOut: 0, currentBudget: 426665, budgetVariance: 425779.4, startDate: "2025-06-01", endDate: "2027-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "SAT should be executed in SD2026, but need to defer to TA2027. To surrender" },
  { id: "PRJ-002", name: "Ammoniation improvement at Urea Reactor during start-up activity", wbs: "", projectManager: "Tan Pin Chian", discipline: "Instrument", originalBudget: 397527, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 397527, budgetVariance: 397527, startDate: "", endDate: "2027-12-01", capexStatus: "New", status: "Not yet started", progress: 0, remarks: "" },
  { id: "PRJ-003", name: "DCS R7 Upgrade and HIS, EWS, OPC & HMI upgrade for DCS, Prosafe and Triconex", wbs: "P.260080001.03.0205", projectManager: "Hasnul Munir", discipline: "Instrument", originalBudget: 3665326, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 3665326, budgetVariance: 3665326, startDate: "2026-01-01", endDate: "2027-12-01", capexStatus: "New", status: "WBS Number created", progress: 0.05, remarks: "Target to issue PO in August" },
  { id: "PRJ-004", name: "E-12-02-01 HEX Replacement", wbs: "P.260080001.03.0202", projectManager: "M Amin Zikri", discipline: "Mechanical", originalBudget: 960000, plannedUtil: 968955, transferIn: 0, transferOut: 0, currentBudget: 960000, budgetVariance: -8955, startDate: "2026-04-04", endDate: "2027-12-01", capexStatus: "New", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-005", name: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", wbs: "P.240080001.03.0210", projectManager: "M Najib Ramli", discipline: "Mechanical", originalBudget: 18800000, plannedUtil: 15285815.12, transferIn: 0, transferOut: 0, currentBudget: 18800000, budgetVariance: 3514184.88, startDate: "2025-06-01", endDate: "2027-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "PO installation target in Oct" },
  { id: "PRJ-006", name: "E-18-02B-01 Replacement", wbs: "", projectManager: "M Amin Zikri", discipline: "Mechanical", originalBudget: 2700000, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 2700000, budgetVariance: 2700000, startDate: "2026-04-04", endDate: "2027-12-01", capexStatus: "New", status: "Cancelled", progress: 0, remarks: "" },
  { id: "PRJ-007", name: "E-18-04 HEX Replacement", wbs: "P.250080001.03.0208", projectManager: "M Amin Zikri", discipline: "Mechanical", originalBudget: 5517600, plannedUtil: 2406600, transferIn: 0, transferOut: 0, currentBudget: 5517600, budgetVariance: 3111000, startDate: "2026-01-01", endDate: "2027-12-01", capexStatus: "New", status: "SOW/PR created", progress: 0.35, remarks: "TCER completed. PO issuance expected by 22 April 2026" },
  { id: "PRJ-008", name: "E-19-03A HEX Replacement", wbs: "P.250080001.03.0209", projectManager: "M Najib Ramli", discipline: "Mechanical", originalBudget: 1560000, plannedUtil: 675000, transferIn: 0, transferOut: 150000, currentBudget: 1410000, budgetVariance: 735000, startDate: "2025-12-01", endDate: "2027-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-009", name: "Fire Water Pump And Foam Panel Replacement", wbs: "P.250080001.03.0308", projectManager: "M Azli Yusof", discipline: "Electrical", originalBudget: 400000, plannedUtil: 408349.2, transferIn: 0, transferOut: 0, currentBudget: 400000, budgetVariance: -8349.2, startDate: "2025-06-01", endDate: "2030-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "Pending installation at site. Current status punchlist clearance" },
  { id: "PRJ-010", name: "Improvement of ammonia loading arm at loading facility", wbs: "P.250080001.03.0245", projectManager: "M Najib Ramli", discipline: "Mechanical", originalBudget: 231000, plannedUtil: 175000, transferIn: 0, transferOut: 0, currentBudget: 231000, budgetVariance: 56000, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "Material delivered" },
  { id: "PRJ-011", name: "Insurance Spares for Melamine", wbs: "P.250080001.03.0220", projectManager: "Sharul Rizal M Zin", discipline: "Melamine", originalBudget: 4000000, plannedUtil: 471140, transferIn: 0, transferOut: 389620, currentBudget: 3610380, budgetVariance: 3139240, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-012", name: "K-11-01 Rotor Inspection and Refurbishment", wbs: "P.240080001.03.0203", projectManager: "M Zulkifli M Zain", discipline: "Rotating", originalBudget: 500000, plannedUtil: 30000, transferIn: 0, transferOut: 165000, currentBudget: 335000, budgetVariance: 305000, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-013", name: "K-12-01 HP Rotor Inspection and Refurbishment", wbs: "P.240080001.03.0204", projectManager: "M Zulkifli M Zain", discipline: "Rotating", originalBudget: 500000, plannedUtil: 30000, transferIn: 0, transferOut: 0, currentBudget: 500000, budgetVariance: 470000, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-014", name: "K-12-01 LP Rotor Inspection and Refurbishment", wbs: "P.240080001.03.0205", projectManager: "M Zulkifli M Zain", discipline: "Rotating", originalBudget: 500000, plannedUtil: 60000, transferIn: 0, transferOut: 0, currentBudget: 500000, budgetVariance: 440000, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-015", name: "KT-12-01 ACV EHPC Actuator Upgrade", wbs: "P.260080001.03.0204", projectManager: "A Hadi B M Yusoff", discipline: "Rotating", originalBudget: 1167403, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 1167403, budgetVariance: 1167403, startDate: "2026-04-01", endDate: "2027-12-01", capexStatus: "New", status: "WBS Number created", progress: 0.05, remarks: "" },
  { id: "PRJ-016", name: "ABB Relay Replacement", wbs: "P.260080001.03.0208", projectManager: "M Farid Bahari", discipline: "Electrical", originalBudget: 422730, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 422730, budgetVariance: 422730, startDate: "2026-04-01", endDate: "2027-12-01", capexStatus: "New", status: "SOW/PR created", progress: 0.35, remarks: "SANCTION DONE. Procurement in progress." },
  { id: "PRJ-017", name: "Motor Operated Valve (MOV) Replacement", wbs: "", projectManager: "M Azli Yusof", discipline: "Electrical", originalBudget: 0, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 0, budgetVariance: 0, startDate: "2026-04-01", endDate: "2027-12-01", capexStatus: "New", status: "Cancelled", progress: 0, remarks: "Surrender to PCG" },
  { id: "PRJ-018", name: "Procurement of Material Handling Equipment for HP reactor R-42-01", wbs: "P.250080001.03.0501", projectManager: "Sharul Rizal M Zin", discipline: "Melamine", originalBudget: 1412500, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 1412500, budgetVariance: 1412500, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "On-going", status: "Capitalisation Completed", progress: 1.0, remarks: "" },
  { id: "PRJ-019", name: "Regulatory Shutdown 2026 (Operational)", wbs: "", projectManager: "Khairil Izham", discipline: "TA", originalBudget: 1928680, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 1928680, budgetVariance: 1928680, startDate: "2025-01-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-020", name: "Regulatory Shutdown 2026 (Statutory)", wbs: "T.2600801.S", projectManager: "Khairil Izham", discipline: "TA", originalBudget: 33530566, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 33530566, budgetVariance: 33530566, startDate: "2025-01-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-021", name: "Rejuvenation HVAC of process & non-process", wbs: "P.250080001.03.0230", projectManager: "M Azli Yusof", discipline: "Electrical", originalBudget: 2850000, plannedUtil: 83000, transferIn: 0, transferOut: 2200000, currentBudget: 650000, budgetVariance: 567000, startDate: "2025-06-01", endDate: "2028-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "Sanction done last year" },
  { id: "PRJ-022", name: "Replacement of Underground Instrument Multipair Cable to above ground", wbs: "P.260080001.03.0206", projectManager: "Hasnul Munir", discipline: "Instrument", originalBudget: 720000, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 720000, budgetVariance: 720000, startDate: "2026-01-01", endDate: "2030-12-01", capexStatus: "New", status: "WBS Number created", progress: 0.05, remarks: "Sanction in progress. PO issuance target on Sept 2026" },
  { id: "PRJ-023", name: "Shiploader Rejuvenation", wbs: "P.240080001.02.0302", projectManager: "Suhaimi Samijan", discipline: "Electrical", originalBudget: 1659039, plannedUtil: 1300000, transferIn: 0, transferOut: 0, currentBudget: 1659039, budgetVariance: 359039, startDate: "2025-06-01", endDate: "2027-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "Completed in 2025 except logistics and accessories. Planning by April" },
  { id: "PRJ-024", name: "Siemens HV Switchgear Retrofit (VCB & VCU)", wbs: "P.250080001.03.0318", projectManager: "M Farid Bahari", discipline: "Electrical", originalBudget: 1952640, plannedUtil: 1650000, transferIn: 0, transferOut: 0, currentBudget: 1952640, budgetVariance: 302640, startDate: "2025-06-01", endDate: "2027-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "Continue from 2025. Remaining to surrender" },
  { id: "PRJ-025", name: "To Purchase Gearbox for KG-31-01", wbs: "P.260080001.03.0201", projectManager: "Ahmad Akmal Adnan", discipline: "Rotating", originalBudget: 3250000, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 3250000, budgetVariance: 3250000, startDate: "2026-01-01", endDate: "2027-12-01", capexStatus: "New", status: "SOW/PR created", progress: 0.35, remarks: "Commercial evaluation" },
  { id: "PRJ-026", name: "TURNAROUND 2027 (Operational)", wbs: "", projectManager: "Khairil Izham", discipline: "TA", originalBudget: 5103660, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 5103660, budgetVariance: 5103660, startDate: "2026-01-01", endDate: "2027-12-01", capexStatus: "On-going", status: "WBS Number created", progress: 0.05, remarks: "" },
  { id: "PRJ-027", name: "TURNAROUND 2027 (Statutory)", wbs: "", projectManager: "Khairil Izham", discipline: "TA", originalBudget: 4851952, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 4851952, budgetVariance: 4851952, startDate: "2026-01-01", endDate: "2028-12-01", capexStatus: "On-going", status: "WBS Number created", progress: 0.05, remarks: "" },
  { id: "PRJ-028", name: "UPS Statron Replacement", wbs: "P.260080001.03.0203", projectManager: "M Farid Bahari", discipline: "Electrical", originalBudget: 1474800, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 1474800, budgetVariance: 1474800, startDate: "2026-04-01", endDate: "2027-12-01", capexStatus: "New", status: "WBS Number created", progress: 0.05, remarks: "SANCTION DONE. Procurement in progress." },
  { id: "PRJ-029", name: "Urea Angle Valve Replacement", wbs: "", projectManager: "Salman Said", discipline: "Mechanical", originalBudget: 0, plannedUtil: 0, transferIn: 0, transferOut: 0, currentBudget: 0, budgetVariance: 0, startDate: "2025-03-01", endDate: "2026-12-01", capexStatus: "New", status: "WBS Number created", progress: 0.05, remarks: "Long lead item. Sanction in progress" },
  { id: "PRJ-030", name: "Replacement of Alarm Management System (AMS)", wbs: "P.240080001.03.0208", projectManager: "Hasnul Munir", discipline: "Instrument", originalBudget: 0, plannedUtil: 800000, transferIn: 0, transferOut: 0, currentBudget: 0, budgetVariance: -800000, startDate: "2025-03-01", endDate: "2026-12-01", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "Surrender to PCG" },
  { id: "PRJ-031", name: "Walkie Talkie License and System Upgrade", wbs: "P.250080001.03.0504", projectManager: "Hasnul Munir", discipline: "Instrument", originalBudget: 0, plannedUtil: 150010.56, transferIn: 0, transferOut: 0, currentBudget: 0, budgetVariance: -150010.56, startDate: "", endDate: "", capexStatus: "On-going", status: "PO issuance completed", progress: 0.6, remarks: "" },
  { id: "PRJ-032", name: "Procurement for Upgrade of 25-LG-02 & 25-LG-03", wbs: "", projectManager: "M Aimin Norman", discipline: "Rotating", originalBudget: 0, plannedUtil: 150000, transferIn: 150000, transferOut: 0, currentBudget: 150000, budgetVariance: 0, startDate: "", endDate: "", capexStatus: "Ad-hoc", status: "Not yet started", progress: 0, remarks: "BOP Presented. Sanction done" },
  { id: "PRJ-033", name: "Rejuvenation HVAC of PDF & UET (BUSH)", wbs: "P.250080001.03.0230", projectManager: "Maryahafida", discipline: "Electrical", originalBudget: 0, plannedUtil: 2850000, transferIn: 2200000, transferOut: 0, currentBudget: 2200000, budgetVariance: -650000, startDate: "2025-03-01", endDate: "2026-12-01", capexStatus: "On-going", status: "SOW/PR created", progress: 0.35, remarks: "Target to issue PO in June. Pending TE" },
  { id: "PRJ-034", name: "K-31-01LP Coupling Cover Improvement", wbs: "P.260080001.03.0101", projectManager: "A Hadi B M Yusoff", discipline: "Rotating", originalBudget: 0, plannedUtil: 165000, transferIn: 165000, transferOut: 0, currentBudget: 165000, budgetVariance: 0, startDate: "2025-03-01", endDate: "2026-12-01", capexStatus: "Ad-hoc", status: "WBS Number created", progress: 0.05, remarks: "New BOP" },
  { id: "PRJ-035", name: "TR101CN2 Transformer Replacement", wbs: "P.260080001.03.0207", projectManager: "M Farid Bahari", discipline: "Electrical", originalBudget: 0, plannedUtil: 389620, transferIn: 389620, transferOut: 0, currentBudget: 389620, budgetVariance: 0, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "Ad-hoc", status: "WBS Number created", progress: 0.05, remarks: "New BOP. Sanction done, pending BT" },
  { id: "PRJ-036", name: "Replacement one complete unit of each type VB with New Model", wbs: "", projectManager: "Salman Said", discipline: "Mechanical", originalBudget: 0, plannedUtil: 60000, transferIn: 0, transferOut: 0, currentBudget: 0, budgetVariance: -60000, startDate: "2025-06-01", endDate: "2026-12-01", capexStatus: "Ad-hoc", status: "Not yet started", progress: 0, remarks: "New BOP" },
];

const SAMPLE_UTILIZATION = [
  // PRJ-001
  { projectId: "PRJ-001", projectName: "ABB LV Switchboard Retrofit", poNumber: "", milestone: "FAT ABB Feeder Replacement", milestonePct: null, planDate: "2026-02-28", planAmount: 885.6, actualDate: "2026-02-20", invoiceNo: "", actualAmount: 885.6, status: "Paid" },
  { projectId: "PRJ-001", projectName: "ABB LV Switchboard Retrofit", poNumber: "3400885717-05", milestone: "SAT", milestonePct: 0.1, planDate: "2026-05-30", planAmount: 94075.92, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-001", projectName: "ABB LV Switchboard Retrofit", poNumber: "3400826255-06", milestone: "Service Completion Certificate and Final Documentation", milestonePct: 0.1, planDate: "2026-05-30", planAmount: 94075.92, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-004
  { projectId: "PRJ-004", projectName: "E-12-02-01 HEX Replacement", poNumber: "3401000524-01", milestone: "Upon PO issuance and Insurance submission", milestonePct: 0.1, planDate: "2026-04-30", planAmount: 99890, actualDate: "2026-05-22", invoiceNo: "", actualAmount: 99890, status: "Paid" },
  { projectId: "PRJ-004", projectName: "E-12-02-01 HEX Replacement", poNumber: "3401000524-02", milestone: "Upon submission of general arrangement drawing (1st issue) & design calculation", milestonePct: 0.15, planDate: "2026-07-31", planAmount: 149835, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-004", projectName: "E-12-02-01 HEX Replacement", poNumber: "3401000524-03", milestone: "Upon delivery of major material at workshop", milestonePct: 0.15, planDate: "2026-09-30", planAmount: 149835, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-004", projectName: "E-12-02-01 HEX Replacement", poNumber: "3401000524-04", milestone: "Upon issuance of Initial Acceptance", milestonePct: 0.4, planDate: "2026-11-30", planAmount: 399560, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-004", projectName: "E-12-02-01 HEX Replacement", poNumber: "3401000524-05", milestone: "Upon delivery as per agreed Delivery Duty Paid (DDP)", milestonePct: 0.15, planDate: "2026-12-31", planAmount: 149835, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-004", projectName: "E-12-02-01 HEX Replacement", poNumber: "3401000524-06", milestone: "Upon submission of Final Documentation and MDR", milestonePct: 0.05, planDate: "2027-01-31", planAmount: 49945, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-004", projectName: "E-12-02-01 HEX Replacement", poNumber: "", milestone: "Miscellaneous", milestonePct: null, planDate: "2027-01-31", planAmount: 20000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-005
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "3400826255-04", milestone: "Upon Shipment Readiness", milestonePct: 0.45, planDate: "2026-12-31", planAmount: 6479550, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "3400826255-05", milestone: "Final Documentation", milestonePct: 0.05, planDate: "2026-12-31", planAmount: 719950, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "XXXXXXXXX-01", milestone: "Purchase Order (PO)", milestonePct: 0.1, planDate: "2026-10-31", planAmount: 3000000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "XXXXXXXXX-02", milestone: "Detail engineering", milestonePct: 0.05, planDate: "2027-12-31", planAmount: 1500000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "XXXXXXXXX-03", milestone: "PO issuance to sub-CONTRACTOR", milestonePct: 0.1, planDate: "2026-12-31", planAmount: 3000000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "XXXXXXXXX-04", milestone: "PO issuance for materials", milestonePct: 0.1, planDate: "2026-12-31", planAmount: 1500000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "XXXXXXXXX-04", milestone: "FAT", milestonePct: null, planDate: "", planAmount: 80000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "XXXXXXXXX-04", milestone: "Miscellaneous", milestonePct: null, planDate: "2026-12-31", planAmount: 500000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-005", projectName: "E-13-06 Replacement of Reformed Gas Waste Heat Boiler", poNumber: "XXXXXXXXX-04", milestone: "FAT (paid)", milestonePct: null, planDate: "2026-12-31", planAmount: 6315.12, actualDate: "2026-05-05", invoiceNo: "", actualAmount: 6315.12, status: "Paid" },
  // PRJ-007
  { projectId: "PRJ-007", projectName: "E-18-04 HEX Replacement", poNumber: "", milestone: "Upon PO issuance and Bank Guarantee (BG) submission", milestonePct: 0.1, planDate: "", planAmount: 240660, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-007", projectName: "E-18-04 HEX Replacement", poNumber: "", milestone: "Upon submission of general arrangement drawing & design calculation", milestonePct: 0.15, planDate: "", planAmount: 360990, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-007", projectName: "E-18-04 HEX Replacement", poNumber: "", milestone: "Upon delivery of major material at workshop", milestonePct: 0.15, planDate: "", planAmount: 360990, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-007", projectName: "E-18-04 HEX Replacement", poNumber: "", milestone: "Upon issuance of Initial Acceptance (successful hydrotest)", milestonePct: 0.4, planDate: "", planAmount: 962640, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-007", projectName: "E-18-04 HEX Replacement", poNumber: "", milestone: "Upon notice of readiness of shipment or delivery", milestonePct: 0.15, planDate: "", planAmount: 360990, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-007", projectName: "E-18-04 HEX Replacement", poNumber: "", milestone: "Upon submission of Final Documentation and MDR", milestonePct: 0.05, planDate: "", planAmount: 120330, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-008
  { projectId: "PRJ-008", projectName: "E-19-03A HEX Replacement", poNumber: "3400937592-04", milestone: "Delivered to site", milestonePct: 0.45, planDate: "2026-07-31", planAmount: 532000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-008", projectName: "E-19-03A HEX Replacement", poNumber: "3400937592-05", milestone: "Final Documentation", milestonePct: 0.05, planDate: "2026-08-31", planAmount: 133000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-008", projectName: "E-19-03A HEX Replacement", poNumber: "3400937592-05", milestone: "FAT", milestonePct: null, planDate: "", planAmount: 10000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-009
  { projectId: "PRJ-009", projectName: "Fire Water Pump And Foam Panel Replacement", poNumber: "3400886843-05", milestone: "SAT", milestonePct: 0.2, planDate: "2026-09-30", planAmount: 272232.8, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-009", projectName: "Fire Water Pump And Foam Panel Replacement", poNumber: "3400886843-06", milestone: "Final Documentation", milestonePct: 0.1, planDate: "2026-10-31", planAmount: 136116.4, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-010
  { projectId: "PRJ-010", projectName: "Improvement of ammonia loading arm at loading facility", poNumber: "3400874145-01", milestone: "Upon Delivery", milestonePct: 0.05, planDate: "2026-07-31", planAmount: 175000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-011
  { projectId: "PRJ-011", projectName: "Insurance Spares for Melamine", poNumber: "3400930767-04", milestone: "Upon WORK delivery/ready to ship", milestonePct: 0.25, planDate: "2026-12-31", planAmount: 157062.5, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-011", projectName: "Insurance Spares for Melamine", poNumber: "3400920956-04", milestone: "Upon WORK delivery/ready to ship", milestonePct: 0.25, planDate: "2026-12-31", planAmount: 87077.5, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-011", projectName: "Insurance Spares for Melamine", poNumber: "3400917364-04", milestone: "Upon WORK delivery/ready to ship", milestonePct: 0.25, planDate: "2026-12-31", planAmount: 23875, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-011", projectName: "Insurance Spares for Melamine", poNumber: "3400920995-04", milestone: "Upon WORK delivery/ready to ship", milestonePct: 0.25, planDate: "2026-12-31", planAmount: 103125, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-011", projectName: "Insurance Spares for Melamine", poNumber: "", milestone: "FAT", milestonePct: 1, planDate: "2026-12-31", planAmount: 50000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-011", projectName: "Insurance Spares for Melamine", poNumber: "", milestone: "Logistics", milestonePct: 1, planDate: "2026-12-31", planAmount: 50000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-012
  { projectId: "PRJ-012", projectName: "K-11-01 Rotor Inspection and Refurbishment", poNumber: "", milestone: "Logistics", milestonePct: 1, planDate: "2026-05-30", planAmount: 30000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-013
  { projectId: "PRJ-013", projectName: "K-12-01 HP Rotor Inspection and Refurbishment", poNumber: "", milestone: "Logistics", milestonePct: 1, planDate: "2026-06-29", planAmount: 30000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-014
  { projectId: "PRJ-014", projectName: "K-12-01 LP Rotor Inspection and Refurbishment", poNumber: "", milestone: "FAT", milestonePct: 1, planDate: "2026-08-31", planAmount: 30000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-014", projectName: "K-12-01 LP Rotor Inspection and Refurbishment", poNumber: "", milestone: "Logistics", milestonePct: 1, planDate: "2026-10-30", planAmount: 30000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-021
  { projectId: "PRJ-021", projectName: "Rejuvenation HVAC of process & non-process", poNumber: "3400852305-05", milestone: "10% Upon Final Doc/Close Out Report", milestonePct: 0.1, planDate: "2026-10-31", planAmount: 83000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-023
  { projectId: "PRJ-023", projectName: "Shiploader Rejuvenation", poNumber: "", milestone: "9pcs Gearbox", milestonePct: 1, planDate: "2026-11-30", planAmount: 400000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-023", projectName: "Shiploader Rejuvenation", poNumber: "", milestone: "Cable Slinger, Instrument Switches", milestonePct: 1, planDate: "2026-11-30", planAmount: 500000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  { projectId: "PRJ-023", projectName: "Shiploader Rejuvenation", poNumber: "", milestone: "Conveyor Cover", milestonePct: 1, planDate: "2026-11-30", planAmount: 400000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-024
  { projectId: "PRJ-024", projectName: "Siemens HV Switchgear Retrofit (VCB & VCU)", poNumber: "3400849056-04", milestone: "Factory Acceptance Test", milestonePct: 0.3, planDate: "2026-12-31", planAmount: 825000, actualDate: "2026-05-21", invoiceNo: "", actualAmount: 825000, status: "Paid" },
  { projectId: "PRJ-024", projectName: "Siemens HV Switchgear Retrofit (VCB & VCU)", poNumber: "3400849056-05", milestone: "SAT", milestonePct: 0.3, planDate: "2026-09-30", planAmount: 825000, actualDate: "2026-05-21", invoiceNo: "", actualAmount: 825000, status: "Paid" },
  // PRJ-030
  { projectId: "PRJ-030", projectName: "Replacement of Alarm Management System (AMS)", poNumber: "", milestone: "Project completion", milestonePct: null, planDate: "", planAmount: 800000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-031
  { projectId: "PRJ-031", projectName: "Walkie Talkie License and System Upgrade", poNumber: "3400927124-03", milestone: "Upon project completion", milestonePct: 0.3, planDate: "2026-12-31", planAmount: 150010.56, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-032
  { projectId: "PRJ-032", projectName: "Procurement for Upgrade of 25-LG-02 & 25-LG-03", poNumber: "", milestone: "", milestonePct: null, planDate: "", planAmount: 150000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-033
  { projectId: "PRJ-033", projectName: "Rejuvenation HVAC of PDF & UET (BUSH)", poNumber: "", milestone: "", milestonePct: null, planDate: "", planAmount: 2850000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-034
  { projectId: "PRJ-034", projectName: "K-31-01LP Coupling Cover Improvement", poNumber: "", milestone: "", milestonePct: null, planDate: "", planAmount: 165000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-035
  { projectId: "PRJ-035", projectName: "TR101CN2 Transformer Replacement", poNumber: "", milestone: "", milestonePct: null, planDate: "", planAmount: 389620, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
  // PRJ-036
  { projectId: "PRJ-036", projectName: "Replacement one complete unit of each type VB with New Model", poNumber: "", milestone: "", milestonePct: null, planDate: "", planAmount: 60000, actualDate: "", invoiceNo: "", actualAmount: 0, status: "Planned" },
];

const SAMPLE_TRANSFERS = [
  { id: "TRF-001", date: "2026-04-02", fromProject: "PRJ-008", toProject: "PRJ-032", reason: "Procurement for Upgrade of 25-LG-02 & 25-LG-03", amount: 150000, approvedBy: "HoP", approvalDate: "", status: "Approved", remarks: "New BOP approved" },
  { id: "TRF-002", date: "2026-04-10", fromProject: "PRJ-021", toProject: "PRJ-033", reason: "Budget reallocation for new project (Rejuvenation HVAC of PDF & UET)", amount: 2200000, approvedBy: "HoP", approvalDate: "", status: "Approved", remarks: "On-going" },
  { id: "TRF-003", date: "2026-04-10", fromProject: "PRJ-012", toProject: "PRJ-034", reason: "Budget reallocation for new project (K-31-01LP Coupling Cover Improvement)", amount: 165000, approvedBy: "HoP", approvalDate: "", status: "Approved", remarks: "New BOP approved" },
  { id: "TRF-004", date: "2026-06-11", fromProject: "PRJ-011", toProject: "PRJ-035", reason: "Budget reallocation for new project (TR101CN2 Transformer Replacement)", amount: 389620, approvedBy: "HoP", approvalDate: "", status: "Approved", remarks: "New BOP approved" },
];

const SAMPLE_BUDGET_SURRENDER = [
  { no: 1, id: "PRJ-001", name: "ABB LV Switchboard Retrofit", wbs: "P.220080001.03.0303", budgetVariance: 425779.4 },
  { no: 2, id: "PRJ-008", name: "E-19-03A HEX Replacement", wbs: "P.250080001.03.0209", budgetVariance: 735000 },
  { no: 3, id: "PRJ-012", name: "K-11-01 Rotor Inspection and Refurbishment", wbs: "P.240080001.03.0203", budgetVariance: 305000 },
  { no: 4, id: "PRJ-013", name: "K-12-01 HP Rotor Inspection and Refurbishment", wbs: "P.240080001.03.0204", budgetVariance: 470000 },
  { no: 5, id: "PRJ-014", name: "K-12-01 LP Rotor Inspection and Refurbishment", wbs: "P.240080001.03.0205", budgetVariance: 440000 },
  { no: 6, id: "PRJ-018", name: "Procurement of Material Handling Equipment for HP reactor R-42-01", wbs: "P.250080001.03.0501", budgetVariance: 1412500 },
  { no: 7, id: "PRJ-023", name: "Shiploader Rejuvenation", wbs: "P.240080001.02.0302", budgetVariance: 359039 },
  { no: 8, id: "PRJ-011", name: "Insurance Spares for Melamine", wbs: "P.250080001.03.0220", budgetVariance: 3139240 },
];

const SAMPLE_BUDGET_REALLOCATION = [
  { no: 1, id: "PRJ-030", name: "Replacement of Alarm Management System (AMS)", wbs: "P.240080001.03.0208", budgetVariance: -800000 },
  { no: 2, id: "PRJ-031", name: "Walkie Talkie License and System Upgrade", wbs: "P.250080001.03.0504", budgetVariance: -150010.56 },
  { no: 3, id: "PRJ-033", name: "Rejuvenation HVAC of PDF & UET (BUSH)", wbs: "P.250080001.03.0230", budgetVariance: -650000 },
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
  if (typeof d === "number") {
    const date = new Date((d - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  if (typeof d === "string") {
    const dotParts = d.split(".");
    if (dotParts.length === 3 && dotParts[2].length === 4) {
      return `${dotParts[2]}-${dotParts[1].padStart(2, '0')}-${dotParts[0].padStart(2, '0')}`;
    }
    return d.split("T")[0];
  }
  if (d instanceof Date) return d.toISOString().split("T")[0];
  return "-";
}

function getEndOfMonth(year, month) {
  return new Date(year, month, 0, 23, 59, 59);
}

function excelDateToString(val) {
  if (!val) return "";
  if (typeof val === "number") {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  if (typeof val === "string") {
    const dotParts = val.split(".");
    if (dotParts.length === 3 && dotParts[2].length === 4) {
      return `${dotParts[2]}-${dotParts[1].padStart(2, '0')}-${dotParts[0].padStart(2, '0')}`;
    }
    return val.split("T")[0];
  }
  return formatDate(val);
}

function getStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "approved" || s === "paid" || s === "fully paid" || s === "healthy" || s === "on-going" || s === "po issuance completed") return PETRONAS.emerald;
  if (s === "planning" || s === "pending" || s === "partial" || s === "caution" || s === "planned" || s === "new" || s === "wbs number created" || s === "sow/pr created") return PETRONAS.yellow;
  if (s === "critical" || s === "overrun" || s === "rejected" || s === "overdue" || s === "behind" || s === "cancelled") return PETRONAS.red;
  if (s === "completed" || s === "not completed" || s === "capitalisation completed") return PETRONAS.blue;
  if (s === "ad-hoc" || s === "not yet started") return PETRONAS.purple;
  return PETRONAS.gray;
}

function getPriorityColor(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "critical") return PETRONAS.red;
  if (p === "high") return PETRONAS.yellow;
  if (p === "medium") return PETRONAS.blue;
  return PETRONAS.gray;
}

function getDisciplineColor(discipline) {
  const d = (discipline || "").toLowerCase();
  if (d === "electrical") return PETRONAS.blue;
  if (d === "mechanical") return PETRONAS.emerald;
  if (d === "instrument") return PETRONAS.purple;
  if (d === "rotating") return PETRONAS.yellow;
  if (d === "ta") return PETRONAS.red;
  if (d === "melamine") return PETRONAS.lime;
  return PETRONAS.gray;
}

export default function CapexDashboard() {
  const [department, setDepartment] = useState(SAMPLE_DEPARTMENT);
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [utilization, setUtilization] = useState(SAMPLE_UTILIZATION);
  const [transfers, setTransfers] = useState(SAMPLE_TRANSFERS);
  const [budgetSurrender, setBudgetSurrender] = useState(SAMPLE_BUDGET_SURRENDER);
  const [budgetReallocation, setBudgetReallocation] = useState(SAMPLE_BUDGET_REALLOCATION);

  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [disciplineFilter, setDisciplineFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [referenceMonth, setReferenceMonth] = useState("2026-06");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const referenceDate = useMemo(() => {
    const [year, month] = referenceMonth.split('-').map(Number);
    return getEndOfMonth(year, month);
  }, [referenceMonth]);

  const referenceMonthLabel = useMemo(() => {
    const [year, month] = referenceMonth.split('-').map(Number);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month - 1]} ${year}`;
  }, [referenceMonth]);

  const ytdUtilization = useMemo(() => {
    return utilization.filter(u => {
      if (!u.planDate) return false;
      const planDate = new Date(u.planDate + "T00:00:00");
      return planDate <= referenceDate;
    });
  }, [utilization, referenceDate]);

  const ytdActualUtilization = useMemo(() => {
    return utilization.filter(u => {
      if (!u.actualDate) return false;
      const actualDate = new Date(u.actualDate + "T00:00:00");
      return actualDate <= referenceDate;
    });
  }, [utilization, referenceDate]);

  const totals = useMemo(() => {
    const originalBudget = projects.reduce((s, p) => s + (p.originalBudget || 0), 0);
    const transferIn = projects.reduce((s, p) => s + (p.transferIn || 0), 0);
    const transferOut = projects.reduce((s, p) => s + (p.transferOut || 0), 0);
    const currentBudget = projects.reduce((s, p) => s + (p.currentBudget || 0), 0);
    const contractValue = projects.reduce((s, p) => s + (p.plannedUtil || 0), 0);
    const planTotal = utilization.reduce((s, u) => s + (u.planAmount || 0), 0);
    const actualTotal = utilization.reduce((s, u) => s + (u.actualAmount || 0), 0);
    const outstanding = currentBudget - actualTotal;

    const ytdPlanTotal = ytdUtilization.reduce((s, u) => s + (u.planAmount || 0), 0);
    const ytdActualTotal = ytdActualUtilization.reduce((s, u) => s + (u.actualAmount || 0), 0);

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
      paymentPct: currentBudget > 0 ? actualTotal / currentBudget : 0,
      budgetVariance: currentBudget - planTotal,
      activeProjects: projects.filter(p => p.capexStatus === "On-going" || p.status === "Active").length,
      totalProjects: projects.length,
      ytdPlanTotal,
      ytdActualTotal,
      ytdPlanUtilPct: currentBudget > 0 ? ytdPlanTotal / currentBudget : 0,
      ytdActualUtilPct: currentBudget > 0 ? ytdActualTotal / currentBudget : 0,
      ytdPlanEntries: ytdUtilization.length,
      ytdPlanExcluded: utilization.length - ytdUtilization.length,
    };
  }, [projects, utilization, ytdUtilization, ytdActualUtilization]);

  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === "ALL" || p.status === statusFilter;
    const matchP = priorityFilter === "ALL" || p.priority === priorityFilter;
    const matchD = disciplineFilter === "ALL" || p.discipline === disciplineFilter;
    return matchQ && matchS && matchP && matchD;
  }), [projects, query, statusFilter, priorityFilter, disciplineFilter]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedProjects = useMemo(() => {
    if (!sortKey) return filteredProjects;
    return [...filteredProjects].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") va = (va || "").toLowerCase();
      if (typeof vb === "string") vb = (vb || "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredProjects, sortKey, sortDir]);

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

  const disciplineOptions = useMemo(() => {
    const s = new Set(["ALL"]);
    projects.forEach(p => { if (p.discipline) s.add(p.discipline); });
    return Array.from(s);
  }, [projects]);

  // Chart: budget by discipline (uses YTD plan data)
  const budgetByDiscipline = useMemo(() => {
    const byDisc = {};
    projects.forEach(p => {
      const d = p.discipline || "Other";
      if (!byDisc[d]) byDisc[d] = { originalBudget: 0, plannedUtil: 0, planUtil: 0 };
      byDisc[d].originalBudget += p.originalBudget || 0;
      byDisc[d].plannedUtil += p.plannedUtil || 0;
    });
    // add YTD plan util per discipline
    ytdUtilization.forEach(u => {
      const proj = projects.find(p => p.id === u.projectId);
      const d = proj?.discipline || "Other";
      if (byDisc[d]) byDisc[d].planUtil += u.planAmount || 0;
    });
    return Object.entries(byDisc).map(([name, v]) => ({
      name,
      "Original Budget": v.originalBudget,
      "Planned Util": v.plannedUtil,
      "Plan Util (YTD)": v.planUtil,
    })).sort((a, b) => b["Original Budget"] - a["Original Budget"]);
  }, [projects, ytdUtilization]);

  // Chart: top projects by budget
  const topProjectsBudget = useMemo(() => {
    return [...filteredProjects]
      .filter(p => p.originalBudget > 0)
      .sort((a, b) => b.originalBudget - a.originalBudget)
      .slice(0, 10)
      .map(p => ({
        name: p.name.length > 25 ? p.name.slice(0, 25) + "..." : p.name,
        "Original Budget": p.originalBudget,
        "Planned Util": p.plannedUtil || 0,
      }));
  }, [filteredProjects]);

  // Plan utilization by project (YTD filtered)
  const planByProject = useMemo(() => {
    const byProj = {};
    ytdUtilization.forEach(u => {
      if (!byProj[u.projectId]) byProj[u.projectId] = { plan: 0, actual: 0, name: u.projectName };
      byProj[u.projectId].plan += u.planAmount || 0;
      byProj[u.projectId].actual += u.actualAmount || 0;
    });
    return Object.entries(byProj)
      .map(([id, v]) => ({ name: v.name.length > 20 ? v.name.slice(0, 20) + "..." : v.name, "Plan (YTD)": v.plan, "Actual": v.actual }))
      .sort((a, b) => b["Plan (YTD)"] - a["Plan (YTD)"]);
  }, [ytdUtilization]);

  const statusDistribution = useMemo(() => {
    const counts = {};
    projects.forEach(p => { const k = p.capexStatus || p.status; counts[k] = (counts[k] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const disciplineDistribution = useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      const d = p.discipline || "Other";
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  // Utilization status summary
  const utilizationStatus = useMemo(() => {
    const overrun = projects.filter(p => {
      const planUtil = utilization.filter(u => u.projectId === p.id).reduce((s, u) => s + (u.planAmount || 0), 0);
      return p.currentBudget > 0 && planUtil > p.currentBudget;
    });
    return { overrunCount: overrun.length, overrunProjects: overrun };
  }, [projects, utilization]);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const input = e.target;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });

        if (wb.SheetNames.includes("Department_Info")) {
          const ws = wb.Sheets["Department_Info"];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const info = {};
          rows.slice(1).forEach(r => { if (r[0] && r[1]) info[r[0]] = r[1]; });
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

        if (wb.SheetNames.includes("Project_Master")) {
          const ws = wb.Sheets["Project_Master"];
          const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          // Find the header row containing "Project ID"
          const hIdx = rawRows.findIndex(r => r && r.some(c => c && String(c).includes("Project ID")));
          if (hIdx >= 0) {
            const headers = rawRows[hIdx].map(h => h ? String(h).trim() : '');
            const col = (name) => {
              const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
              return idx >= 0 ? idx : -1;
            };
            const dataRows = rawRows.slice(hIdx + 1);
            const parsed = dataRows
              .filter(r => r && r[col("Project ID")] && String(r[col("Project ID")]).startsWith("PRJ-"))
              .map(r => ({
                id: r[col("Project ID")] || "",
                name: r[col("Project Name")] || "",
                wbs: r[col("WBS Number")] || "",
                projectManager: r[col("Project Manager")] || "",
                discipline: r[col("Discipline")] || "",
                originalBudget: parseFloat(r[col("Original Budget")]) || 0,
                transferIn: parseFloat(r[col("Budget Transfer In")]) || parseFloat(r[col("Transfer In")]) || 0,
                transferOut: parseFloat(r[col("Budget Transfer Out")]) || parseFloat(r[col("Transfer Out")]) || 0,
                currentBudget: parseFloat(r[col("Current Budget")]) || 0,
                plannedUtil: parseFloat(r[col("Planned Utilisation")]) || parseFloat(r[col("Planned Util")]) || 0,
                budgetVariance: parseFloat(r[col("Budget Variance")]) || 0,
                startDate: r[col("Start Date")] ? formatDate(r[col("Start Date")]) : "",
                endDate: r[col("End Date")] ? formatDate(r[col("End Date")]) : "",
                capexStatus: r[col("CAPEX Status")] || "",
                status: r[col("Current Project Status")] || r[col("Project Status")] || "Planning",
                progress: parseFloat(r[col("Overall Progress")]) || 0,
                priority: r[col("Priority")] || "Medium",
                remarks: r[col("Remarks")] || "",
              }));
            if (parsed.length) setProjects(parsed);
          }
        }

        // Support both old "Utilization" and new "CAPEX_Tracker" sheet
        const utilSheetName = wb.SheetNames.includes("CAPEX_Tracker") ? "CAPEX_Tracker" : "Utilization";
        if (wb.SheetNames.includes(utilSheetName)) {
          const ws = wb.Sheets[utilSheetName];
          const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          // Find header row — look for a row where FIRST cell starts with "Project ID"
          const headerIdx = rawRows.findIndex(r => r && r[0] && String(r[0]).replace(/\r?\n/g, ' ').trim().startsWith("Project ID"));
          if (headerIdx >= 0) {
            const headers = rawRows[headerIdx].map(h => h ? String(h).replace(/\r?\n/g, ' ').trim() : '');
            // Flexible column finder — matches partial names
            const col = (name) => {
              const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
              return idx >= 0 ? idx : -1;
            };
            const dataRows = rawRows.slice(headerIdx + 1);
            const parsed = dataRows
              .filter(r => r && r[col("Project ID")] && String(r[col("Project ID")]).startsWith("PRJ-"))
              .map(r => ({
                projectId: r[col("Project ID")] || "",
                projectName: r[col("Project Name")] || "",
                poNumber: r[col("PO Number")] || "",
                milestone: r[col("Milestone Desc")] || "",
                milestonePct: parseFloat(r[col("Milestone %")]) || 0,
                planDate: excelDateToString(r[col("Plan Date")]),
                planAmount: parseFloat(r[col("Plan Amount")]) || parseFloat(r[headers.length]) || 0,
                actualDate: excelDateToString(r[col("Actual Date")]),
                invoiceNo: r[col("Invoice")] || "",
                actualAmount: parseFloat(r[col("Actual Amt")]) || 0,
                status: r[col("MS Status")] || r[col("Status")] || "",
              }));
            if (parsed.length) setUtilization(parsed);
          }
        }

        if (wb.SheetNames.includes("Budget_Transfers")) {
          const ws = wb.Sheets["Budget_Transfers"];
          const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const hIdx = rawRows.findIndex(r => r && r[0] && String(r[0]).replace(/\r?\n/g, " ").trim().startsWith("Transfer ID"));
          if (hIdx >= 0) {
            const headers = rawRows[hIdx].map(h => h ? String(h).replace(/\r?\n/g, " ").trim() : "");
            const col = (name) => { const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase())); return idx >= 0 ? idx : -1; };
            const parsed = rawRows.slice(hIdx + 1)
              .filter(r => r && r[col("Transfer ID")] && String(r[col("Transfer ID")]).startsWith("TRF-"))
              .map(r => ({
                id: r[col("Transfer ID")] || "",
                date: r[col("Transfer Date")] ? formatDate(r[col("Transfer Date")]) : "",
                fromProject: r[col("From Project")] || "",
                toProject: r[col("To Project")] || "",
                reason: r[col("Reason")] || r[col("Justification")] || "",
                amount: parseFloat(r[col("Amount")]) || 0,
                approvedBy: r[col("Approved By")] || "",
                approvalDate: r[col("Approval Date")] ? formatDate(r[col("Approval Date")]) : "",
                status: r[col("Transfer Status")] || r[col("Status")] || "Pending",
                remarks: r[col("Remarks")] || "",
              }));
            if (parsed.length) setTransfers(parsed);
          }
        }

        if (wb.SheetNames.includes("Budget_Optimization")) {
          const ws = wb.Sheets["Budget_Optimization"];
          const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          console.log("[Budget_Optimization] Total rows:", rawRows.length);

          // Parse Budget Surrender section
          const surrenderHeaderIdx = rawRows.findIndex(r => r && r[0] != null && String(r[0]).includes("BUDGET SURRENDER"));
          console.log("[Budget_Optimization] Surrender header at row:", surrenderHeaderIdx);
          if (surrenderHeaderIdx >= 0) {
            const sRows = [];
            for (let i = surrenderHeaderIdx + 2; i < rawRows.length; i++) {
              const r = rawRows[i];
              if (!r) break;
              const id = r[1];
              const firstCol = r[0] != null ? String(r[0]) : "";
              if (firstCol.includes("TOTAL")) break;
              if (!id) break;
              sRows.push({
                no: r[0],
                id: String(id),
                name: String(r[2] || "").trim(),
                wbs: r[3] && r[3] !== 0 ? String(r[3]) : "",
                budgetVariance: parseFloat(r[4]) || 0,
                surrenderAmount: parseFloat(r[5]) || 0,
              });
            }
            console.log("[Budget_Optimization] Surrender rows parsed:", sRows.length, sRows);
            setBudgetSurrender(sRows);
          }

          // Parse Budget Reallocation section
          const reallocHeaderIdx = rawRows.findIndex(r => r && r[0] != null && String(r[0]).includes("BUDGET REALLOCATION"));
          console.log("[Budget_Optimization] Reallocation header at row:", reallocHeaderIdx);
          if (reallocHeaderIdx >= 0) {
            const rRows = [];
            for (let i = reallocHeaderIdx + 2; i < rawRows.length; i++) {
              const r = rawRows[i];
              if (!r) break;
              const id = r[1];
              const firstCol = r[0] != null ? String(r[0]) : "";
              if (firstCol.includes("TOTAL")) break;
              if (!id) break;
              rRows.push({
                no: r[0],
                id: String(id),
                name: String(r[2] || "").trim(),
                wbs: r[3] && r[3] !== 0 ? String(r[3]) : "",
                budgetVariance: parseFloat(r[4]) || 0,
                reallocationAmount: parseFloat(r[5]) || 0,
              });
            }
            console.log("[Budget_Optimization] Reallocation rows parsed:", rRows.length, rRows);
            setBudgetReallocation(rRows);
          }
        } else {
          console.log("[Budget_Optimization] Sheet not found in:", wb.SheetNames);
        }
      } catch (err) {
        console.error("Error parsing Excel:", err);
      }
      input.value = "";
    };
    reader.readAsBinaryString(f);
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "transfers", label: "Budget Transfers" },
    { id: "optimization", label: "Budget Optimization" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl p-4 shadow">
          <div>
            <h1 className="text-xl font-bold text-gray-800">MAINTENANCE CAPEX DASHBOARD</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Fiscal Year: <strong>{department.fiscalYear}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">Reference Month:</label>
              <select
                value={referenceMonth}
                onChange={(e) => setReferenceMonth(e.target.value)}
                className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-sm font-semibold focus:border-[#00B1A9] focus:outline-none"
              >
                {[
                  { value: '2026-01', label: 'January 2026' },
                  { value: '2026-02', label: 'February 2026' },
                  { value: '2026-03', label: 'March 2026' },
                  { value: '2026-04', label: 'April 2026' },
                  { value: '2026-05', label: 'May 2026' },
                  { value: '2026-06', label: 'June 2026' },
                  { value: '2026-07', label: 'July 2026' },
                  { value: '2026-08', label: 'August 2026' },
                  { value: '2026-09', label: 'September 2026' },
                  { value: '2026-10', label: 'October 2026' },
                  { value: '2026-11', label: 'November 2026' },
                  { value: '2026-12', label: 'December 2026' },
                ].map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
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
                activeTab === tab.id ? "text-white" : "text-gray-600 hover:bg-gray-100"
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
                { label: "Plan Utilization (YTD)", val: formatMYR(totals.ytdPlanTotal), sub: formatPct(totals.ytdPlanUtilPct), note: `As of ${referenceMonthLabel}`, color: PETRONAS.purple },
                { label: "Actual Paid (YTD)", val: formatMYR(totals.ytdActualTotal), sub: formatPct(totals.ytdActualUtilPct), note: `As of ${referenceMonthLabel}`, color: PETRONAS.emerald },
                { label: "Outstanding", val: formatMYR(totals.outstanding), color: PETRONAS.yellow },
              ].map(k => (
                <div key={k.label} className="rounded-xl border bg-white p-4 shadow" title={k.note ? `Includes only entries with Plan Date ≤ ${referenceMonthLabel}` : undefined}>
                  <div className="text-xs text-gray-500 mb-1">{k.label}</div>
                  <div className="text-lg font-bold" style={{ color: k.color }}>{k.val}</div>
                  {k.sub && <div className="text-xs text-gray-400">{k.sub}</div>}
                  {k.note && <div className="text-[10px] text-gray-400 mt-0.5">{k.note}</div>}
                </div>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Total Projects</div>
                <div className="text-2xl font-bold">{totals.totalProjects}</div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Active Projects</div>
                <div className="text-2xl font-bold" style={{ color: PETRONAS.emerald }}>{totals.activeProjects}</div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow" title={`YTD Plan: includes ${totals.ytdPlanEntries} entries with Plan Date ≤ ${referenceMonthLabel} (${totals.ytdPlanExcluded} excluded)`}>
                <div className="text-xs text-gray-500">Plan Utilization % (YTD)</div>
                <div className="text-2xl font-bold" style={{ color: totals.ytdPlanUtilPct > 0.9 ? PETRONAS.red : PETRONAS.purple }}>{formatPct(totals.ytdPlanUtilPct)}</div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Payment Completion %</div>
                <div className="text-2xl font-bold" style={{ color: totals.paymentPct === 0 ? PETRONAS.red : PETRONAS.emerald }}>{formatPct(totals.paymentPct)}</div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Utilization & Payment Progress</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Plan Utilization (YTD - {referenceMonthLabel})</span>
                      <span>{formatPct(totals.ytdPlanUtilPct)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200">
                      <div className="h-3 rounded-full" style={{ width: Math.min(100, totals.ytdPlanUtilPct * 100) + "%", backgroundColor: PETRONAS.purple }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Actual Utilization (YTD)</span>
                      <span>{formatPct(totals.ytdActualUtilPct)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200">
                      <div className="h-3 rounded-full" style={{ width: Math.min(100, totals.ytdActualUtilPct * 100) + "%", backgroundColor: PETRONAS.emerald }} />
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
                <div className="text-sm font-medium mb-3">Project Distribution by Discipline</div>
                <div className="h-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={disciplineDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                        {disciplineDistribution.map((entry, i) => (
                          <Cell key={i} fill={getDisciplineColor(entry.name)} />
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
                <div className="text-sm font-medium mb-3">Budget by Discipline</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={budgetByDiscipline} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={v => formatMYR(v)} />
                      <Legend />
                      <Bar dataKey="Original Budget" fill={PETRONAS.gray} />
                      <Bar dataKey="Planned Util" fill={PETRONAS.blue} />
                      <Bar dataKey="Plan Util (YTD)" fill={PETRONAS.purple} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Top 10 Projects by Budget</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={topProjectsBudget} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 9 }} />
                      <Tooltip formatter={v => formatMYR(v)} />
                      <Legend />
                      <Bar dataKey="Original Budget" fill={PETRONAS.gray} />
                      <Bar dataKey="Planned Util" fill={PETRONAS.emerald} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Project Status Pie + Plan vs Actual */}
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Project Status Distribution</div>
                <div className="h-56">
                  <ResponsiveContainer>
                    <PieChart margin={{ top: 20, bottom: 20 }}>
                      <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${value}`}>
                        {statusDistribution.map((entry, i) => (
                          <Cell key={i} fill={getStatusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-sm font-medium mb-3">Plan vs Actual by Project (YTD - {referenceMonthLabel})</div>
                <div className="h-48">
                  <ResponsiveContainer>
                    <BarChart data={planByProject.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1) + "M" : (v/1e3).toFixed(0) + "k"} />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 9 }} />
                      <Tooltip formatter={v => formatMYR(v)} />
                      <Legend />
                      <Bar dataKey="Plan (YTD)" fill={PETRONAS.purple} />
                      <Bar dataKey="Actual" fill={PETRONAS.emerald} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Project-Level Breakdown Table */}
            <div className="rounded-xl border bg-white shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="text-sm font-medium">PROJECT-LEVEL BREAKDOWN <span className="text-xs font-normal text-gray-400">(YTD as of {referenceMonthLabel})</span></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      <th className="p-2">Project ID</th>
                      <th className="p-2">Project Name</th>
                      <th className="p-2">Discipline</th>
                      <th className="p-2 text-right">Original Budget</th>
                      <th className="p-2 text-right">Current Budget</th>
                      <th className="p-2 text-right">Plan Util (YTD)</th>
                      <th className="p-2 text-right">Actual Paid</th>
                      <th className="p-2 text-right">Plan % (YTD)</th>
                      <th className="p-2 text-right">Actual %</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.filter(p => p.originalBudget > 0).map((p, i) => {
                      const planUtil = ytdUtilization.filter(u => u.projectId === p.id).reduce((s, u) => s + (u.planAmount || 0), 0);
                      const actualUtil = utilization.filter(u => u.projectId === p.id).reduce((s, u) => s + (u.actualAmount || 0), 0);
                      const planPct = p.currentBudget > 0 ? planUtil / p.currentBudget : 0;
                      const actualPct = p.currentBudget > 0 ? actualUtil / p.currentBudget : 0;
                      const status = planPct > 1 ? "Overrun" : "Healthy";
                      return (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono">{p.id}</td>
                          <td className="p-2 max-w-[200px] truncate">{p.name}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded text-white text-[10px]" style={{ backgroundColor: getDisciplineColor(p.discipline) }}>{p.discipline}</span>
                          </td>
                          <td className="p-2 text-right">{formatMYR(p.originalBudget)}</td>
                          <td className="p-2 text-right font-medium" style={{ color: PETRONAS.blue }}>{formatMYR(p.currentBudget)}</td>
                          <td className="p-2 text-right" style={{ color: PETRONAS.purple }}>{formatMYR(planUtil)}</td>
                          <td className="p-2 text-right" style={{ color: PETRONAS.emerald }}>{formatMYR(actualUtil)}</td>
                          <td className="p-2 text-right">{formatPct(planPct)}</td>
                          <td className="p-2 text-right">{formatPct(actualPct)}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded-full text-white text-[10px]" style={{ backgroundColor: getStatusColor(status) }}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

              <select value={disciplineFilter} onChange={e => setDisciplineFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                {disciplineOptions.map(s => <option key={s} value={s}>{s === "ALL" ? "All Disciplines" : s}</option>)}
              </select>
            </div>

            <div className="rounded-xl border bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      {[
                        { key: "id", label: "Project ID" },
                        { key: "name", label: "Project Name" },
                        { key: "capexStatus", label: "CAPEX Status" },
                        { key: "discipline", label: "Discipline" },
                        { key: "projectManager", label: "Project Manager" },
                        { key: "plannedUtil", label: "Planned Utilisation", right: true },
                        { key: "currentBudget", label: "Current Budget", right: true },
                        { key: "budgetVariance", label: "Budget Variance", right: true },
                        { key: "status", label: "Status" },

                        { key: "endDate", label: "End Date" },
                        { key: "remarks", label: "Remarks" },
                      ].map(col => (
                        <th
                          key={col.key}
                          className={`p-3 cursor-pointer select-none hover:bg-gray-100 transition ${col.right ? "text-right" : ""}`}
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label} {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProjects.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{p.id}</td>
                        <td className="p-3 font-medium text-sm max-w-[250px]">{p.name}</td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap" style={{ backgroundColor: getStatusColor(p.capexStatus || p.status) }}>{p.capexStatus || p.status}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: getDisciplineColor(p.discipline) }}>{p.discipline}</span>
                        </td>
                        <td className="p-3 text-gray-600 text-xs">{p.projectManager}</td>
                        <td className="p-3 text-right text-xs">{formatMYR(p.plannedUtil || 0)}</td>
                        <td className="p-3 text-right font-medium text-xs" style={{ color: PETRONAS.blue }}>{formatMYR(p.currentBudget)}</td>
                        <td className="p-3 text-right text-xs" style={{ color: p.budgetVariance >= 0 ? PETRONAS.emerald : PETRONAS.red }}>{formatMYR(p.budgetVariance)}</td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap text-center" style={{ backgroundColor: getStatusColor(p.status) }}>{p.status}</span>
                        </td>
                        <td className="p-3 hidden">
                        </td>
                        <td className="p-3 text-gray-600 text-xs">{p.endDate || "-"}</td>
                        <td className="p-3 text-gray-500 text-xs max-w-[150px] truncate">{p.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-gray-50 font-bold text-xs">
                      <td className="p-3" colSpan={5}>TOTAL ({sortedProjects.length} projects)</td>
                      <td className="p-3 text-right">{formatMYR(sortedProjects.reduce((s, p) => s + (p.plannedUtil || 0), 0))}</td>
                      <td className="p-3 text-right" style={{ color: PETRONAS.blue }}>{formatMYR(sortedProjects.reduce((s, p) => s + (p.currentBudget || 0), 0))}</td>
                      <td className="p-3 text-right" style={{ color: sortedProjects.reduce((s, p) => s + (p.budgetVariance || 0), 0) >= 0 ? PETRONAS.emerald : PETRONAS.red }}>{formatMYR(sortedProjects.reduce((s, p) => s + (p.budgetVariance || 0), 0))}</td>
                      <td className="p-3" colSpan={4}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-500 border-t bg-gray-50">
                Showing {sortedProjects.length} of {projects.length} projects
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
                <div className="text-xs text-gray-500">Total Approved Transfer</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.emerald }}>
                  {formatMYR(transfers.reduce((s, t) => s + t.amount, 0))}
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
                    {transfers.length === 0 ? (
                      <tr><td colSpan="8" className="p-8 text-center text-gray-400">No budget transfers recorded</td></tr>
                    ) : transfers.map((t, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{t.id}</td>
                        <td className="p-3">{t.date}</td>
                        <td className="p-3 font-mono text-xs">{t.fromProject}</td>
                        <td className="p-3 font-mono text-xs">{t.toProject}</td>
                        <td className="p-3 text-right font-medium" style={{ color: PETRONAS.blue }}>{formatMYR(t.amount)}</td>
                        <td className="p-3 text-gray-600 max-w-[200px] truncate">{t.reason}</td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap text-center" style={{ backgroundColor: getStatusColor(t.status) }}>{t.status}</span>
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

        {/* Budget Optimization Tab */}
        {activeTab === "optimization" && (
          <>
            {/* Summary Cards */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Total Surrender Variance</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.emerald }}>
                  {formatMYR(budgetSurrender.reduce((s, b) => s + b.budgetVariance, 0))}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Total Reallocation Needed</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.red }}>
                  {formatMYR(Math.abs(budgetReallocation.reduce((s, b) => s + b.budgetVariance, 0)))}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Net Balance</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.blue }}>
                  {formatMYR(budgetSurrender.reduce((s, b) => s + b.budgetVariance, 0) + budgetReallocation.reduce((s, b) => s + b.budgetVariance, 0))}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow">
                <div className="text-xs text-gray-500">Projects Needing Budget</div>
                <div className="text-lg font-bold" style={{ color: PETRONAS.red }}>{budgetReallocation.length}</div>
              </div>
            </div>

            {/* Budget Surrender Table */}
            <div className="rounded-xl border bg-white shadow overflow-hidden mb-4">
              <div className="p-4 border-b bg-gray-50">
                <div className="text-sm font-medium">BUDGET SURRENDER (Projects with Positive Variance)</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      <th className="p-2">No</th>
                      <th className="p-2">Project ID</th>
                      <th className="p-2">Project Name</th>
                      <th className="p-2">WBS Number</th>
                      <th className="p-2 text-right">Budget Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetSurrender.map((b, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2">{b.no}</td>
                        <td className="p-2 font-mono">{b.id}</td>
                        <td className="p-2">{b.name}</td>
                        <td className="p-2 font-mono">{b.wbs || "-"}</td>
                        <td className="p-2 text-right font-medium" style={{ color: PETRONAS.emerald }}>{formatMYR(b.budgetVariance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium text-xs">
                      <td colSpan="4" className="p-2 text-right">Total Surrender:</td>
                      <td className="p-2 text-right" style={{ color: PETRONAS.emerald }}>
                        {formatMYR(budgetSurrender.reduce((s, b) => s + b.budgetVariance, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Budget Reallocation Table */}
            <div className="rounded-xl border bg-white shadow overflow-hidden mb-4">
              <div className="p-4 border-b bg-gray-50">
                <div className="text-sm font-medium">BUDGET REALLOCATION (Projects with Negative Variance)</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-600">
                      <th className="p-2">No</th>
                      <th className="p-2">Project ID</th>
                      <th className="p-2">Project Name</th>
                      <th className="p-2">WBS Number</th>
                      <th className="p-2 text-right">Budget Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetReallocation.map((b, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2">{b.no}</td>
                        <td className="p-2 font-mono">{b.id}</td>
                        <td className="p-2">{b.name}</td>
                        <td className="p-2 font-mono">{b.wbs || "-"}</td>
                        <td className="p-2 text-right font-medium" style={{ color: PETRONAS.red }}>{formatMYR(b.budgetVariance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium text-xs">
                      <td colSpan="4" className="p-2 text-right">Total Reallocation:</td>
                      <td className="p-2 text-right" style={{ color: PETRONAS.red }}>
                        {formatMYR(budgetReallocation.reduce((s, b) => s + b.budgetVariance, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Note */}
            <div className="rounded-xl border bg-white p-4 shadow text-xs text-gray-500">
              <span style={{ color: PETRONAS.emerald }}>Green = Surplus (can surrender)</span>{" | "}
              <span style={{ color: PETRONAS.red }}>Red = Deficit (needs reallocation)</span>{" | "}
              Net Balance should be ≥ 0.
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-400">
          Department: {department.name} | Head: {department.departmentHead} | Budget Controller: {department.budgetController} | Currency: {department.currency}
        </div>
      </div>
    </div>
  );
}
