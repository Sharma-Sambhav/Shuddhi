export interface Product {
  id: string
  name: string
  gtin: string
  dosageForm: string
}

export interface Batch {
  id: string
  productId: string
  size: number
  status: "In Production" | "QA Review" | "In QC" | "Released" | "On Hold"
  mfgDate: string
  expDate: string
  market: "Domestic" | "Export" | "Domestic+Export"
  exceptions?: number
}

export interface EBRStep {
  id: string
  batchId: string
  step: string
  unit: string
  specMin: number
  specMax: number
  value: number
  status: "OK" | "OOT" | "OOS"
  user: string
  timestamp: string
  comments?: string
}

export interface Deviation {
  id: string
  batchId: string
  type: "Process" | "Quality" | "Equipment" | "Documentation"
  title: string
  status: "Open" | "Investigation" | "CAPA in Progress" | "Closed"
  openedBy: string
  openedOn: string
  aiHints: string[]
  severity: "Low" | "Medium" | "High" | "Critical"
}

export interface Vendor {
  id: string
  name: string
  approved: boolean
  materials: string[]
  lastAudit?: string
}

export interface CoA {
  id: string
  vendorId: string
  material: string
  lot: string
  params: {
    name: string
    value: number
    unit: string
    min: number
    max: number
    status?: "Pass" | "Fail"
  }[]
  receivedOn: string
}

export interface StabilityStudy {
  id: string
  productId: string
  conditions: string
  points: {
    month: number
    assay: number
    dissolution: number
    impurities?: number
  }[]
}

export interface TrainingRecord {
  user: string
  skill: string
  validTill: string
  status: "Valid" | "Expired" | "Expiring Soon"
}

export interface AuditEvent {
  id: string
  entity: string
  action: string
  user: string
  timestamp: string
  details?: string
}

export interface SerializationPack {
  batchId: string
  gtin: string
  sscc: string
  sgtins: string[]
  status: "Generated" | "Commissioned" | "Packed" | "Shipped"
}

export interface RecallSignal {
  id: string
  productId: string
  batchId: string
  state: string
  city: string
  scans: number
  status: "Genuine" | "Suspected Counterfeit" | "Duplicate" | "Not Found"
  reportedOn: string
}

// Mock data
export const products: Product[] = [
  { id: "P-IBU-400", name: "Ibuprofen 400 mg Tablet", gtin: "08904000001234", dosageForm: "Tablet" },
  { id: "P-PARA-650", name: "Paracetamol 650 mg Tablet", gtin: "08904000005678", dosageForm: "Tablet" },
  { id: "P-CS-100", name: "Cough Syrup 100 ml", gtin: "08904000007890", dosageForm: "Liquid" },
  { id: "P-AMX-500", name: "Amoxicillin 500 mg Capsule", gtin: "08904000009876", dosageForm: "Capsule" },
  { id: "P-CET-10", name: "Cetirizine 10 mg Tablet", gtin: "08904000005432", dosageForm: "Tablet" },
]

export const batches: Batch[] = [
  {
    id: "IBU-2025-09-001",
    productId: "P-IBU-400",
    size: 1000000,
    status: "QA Review",
    mfgDate: "2025-08-28",
    expDate: "2027-08-27",
    market: "Domestic+Export",
    exceptions: 3,
  },
  {
    id: "PARA-2025-08-014",
    productId: "P-PARA-650",
    size: 800000,
    status: "In QC",
    mfgDate: "2025-08-20",
    expDate: "2027-08-19",
    market: "Export",
    exceptions: 1,
  },
  {
    id: "CS-2025-08-007",
    productId: "P-CS-100",
    size: 200000,
    status: "Released",
    mfgDate: "2025-08-05",
    expDate: "2026-08-04",
    market: "Domestic",
    exceptions: 0,
  },
  {
    id: "AMX-2025-09-003",
    productId: "P-AMX-500",
    size: 500000,
    status: "In Production",
    mfgDate: "2025-09-01",
    expDate: "2027-09-01",
    market: "Export",
    exceptions: 0,
  },
  {
    id: "CET-2025-08-012",
    productId: "P-CET-10",
    size: 750000,
    status: "On Hold",
    mfgDate: "2025-08-15",
    expDate: "2027-08-14",
    market: "Domestic",
    exceptions: 2,
  },
]

export const ebrSteps: EBRStep[] = [
  {
    id: "S1",
    batchId: "IBU-2025-09-001",
    step: "Granulation Temp",
    unit: "°C",
    specMin: 50,
    specMax: 55,
    value: 52.3,
    status: "OK",
    user: "operator.ramesh",
    timestamp: "2025-09-02T10:45:00Z",
  },
  {
    id: "S2",
    batchId: "IBU-2025-09-001",
    step: "FBD Outlet Temp",
    unit: "°C",
    specMin: 60,
    specMax: 70,
    value: 72.1,
    status: "OOS",
    user: "operator.ramesh",
    timestamp: "2025-09-02T12:10:00Z",
    comments: "Temperature exceeded limit during drying cycle",
  },
  {
    id: "S3",
    batchId: "IBU-2025-09-001",
    step: "Tablet Hardness",
    unit: "kp",
    specMin: 6,
    specMax: 9,
    value: 5.4,
    status: "OOT",
    user: "qa.mahesh",
    timestamp: "2025-09-02T14:05:00Z",
    comments: "Below trend limit, investigating compression force",
  },
  {
    id: "S4",
    batchId: "IBU-2025-09-001",
    step: "Moisture Content",
    unit: "%",
    specMin: 0.5,
    specMax: 2.0,
    value: 3.2,
    status: "OOS",
    user: "qa.mahesh",
    timestamp: "2025-09-02T16:20:00Z",
    comments: "Excessive moisture detected",
  },
  {
    id: "S5",
    batchId: "PARA-2025-08-014",
    step: "Blend Uniformity",
    unit: "%",
    specMin: 95,
    specMax: 105,
    value: 98.7,
    status: "OK",
    user: "operator.priya",
    timestamp: "2025-08-21T09:30:00Z",
  },
  {
    id: "S6",
    batchId: "PARA-2025-08-014",
    step: "Dissolution Rate",
    unit: "%",
    specMin: 80,
    specMax: 100,
    value: 76.5,
    status: "OOT",
    user: "qa.suresh",
    timestamp: "2025-08-21T15:45:00Z",
    comments: "Slightly below trend, monitoring",
  },
]

export const deviations: Deviation[] = [
  {
    id: "D-1042",
    batchId: "IBU-2025-09-001",
    type: "Process",
    title: "High FBD outlet temperature",
    status: "Open",
    openedBy: "qa.suresh",
    openedOn: "2025-09-02",
    severity: "High",
    aiHints: [
      "Check thermocouple calibration drift",
      "Cross-check PLC setpoint vs actual reading",
      "Inspect air flow filter for clogging",
      "Review maintenance logs for heating elements",
    ],
  },
  {
    id: "D-1043",
    batchId: "IBU-2025-09-001",
    type: "Quality",
    title: "Tablet hardness below specification",
    status: "Investigation",
    openedBy: "qa.mahesh",
    openedOn: "2025-09-02",
    severity: "Medium",
    aiHints: [
      "Verify compression force settings",
      "Check punch and die wear patterns",
      "Analyze granule flow properties",
      "Review lubrication levels",
    ],
  },
  {
    id: "D-1044",
    batchId: "CET-2025-08-012",
    type: "Equipment",
    title: "Coating pan temperature fluctuation",
    status: "CAPA in Progress",
    openedBy: "operator.raj",
    openedOn: "2025-08-16",
    severity: "Critical",
    aiHints: [
      "Replace temperature sensor",
      "Calibrate heating system",
      "Check electrical connections",
      "Update preventive maintenance schedule",
    ],
  },
]

export const vendors: Vendor[] = [
  {
    id: "V-API-01",
    name: "Zena API Pvt Ltd",
    approved: true,
    materials: ["Ibuprofen API", "Paracetamol API"],
    lastAudit: "2024-12-15",
  },
  {
    id: "V-EXC-02",
    name: "Pharma Excipients Co",
    approved: true,
    materials: ["Microcrystalline Cellulose", "Magnesium Stearate"],
    lastAudit: "2025-01-20",
  },
  {
    id: "V-PKG-03",
    name: "MediPack Solutions",
    approved: false,
    materials: ["Blister Packs", "Labels"],
    lastAudit: "2024-08-10",
  },
]

export const coas: CoA[] = [
  {
    id: "COA-7781",
    vendorId: "V-API-01",
    material: "Ibuprofen API",
    lot: "API-IBU-25-0815",
    params: [
      { name: "Assay", value: 99.1, unit: "%", min: 98.0, max: 102.0, status: "Pass" },
      { name: "Impurity B", value: 0.16, unit: "%", min: 0, max: 0.15, status: "Fail" },
      { name: "Heavy Metals", value: 8.5, unit: "ppm", min: 0, max: 10, status: "Pass" },
      { name: "Moisture", value: 0.8, unit: "%", min: 0, max: 1.0, status: "Pass" },
    ],
    receivedOn: "2025-08-16",
  },
  {
    id: "COA-7782",
    vendorId: "V-EXC-02",
    material: "Microcrystalline Cellulose",
    lot: "MCC-25-0820",
    params: [
      { name: "Loss on Drying", value: 4.2, unit: "%", min: 0, max: 5.0, status: "Pass" },
      { name: "pH", value: 6.8, unit: "", min: 5.0, max: 7.5, status: "Pass" },
      { name: "Bulk Density", value: 0.32, unit: "g/ml", min: 0.26, max: 0.35, status: "Pass" },
    ],
    receivedOn: "2025-08-20",
  },
]

export const stabilityStudies: StabilityStudy[] = [
  {
    id: "ST-IBU-01",
    productId: "P-IBU-400",
    conditions: "25°C/60%RH",
    points: [
      { month: 0, assay: 100.0, dissolution: 99.2, impurities: 0.05 },
      { month: 3, assay: 99.6, dissolution: 98.4, impurities: 0.08 },
      { month: 6, assay: 99.2, dissolution: 97.9, impurities: 0.12 },
      { month: 9, assay: 98.8, dissolution: 97.1, impurities: 0.15 },
      { month: 12, assay: 98.4, dissolution: 96.8, impurities: 0.18 },
    ],
  },
  {
    id: "ST-PARA-01",
    productId: "P-PARA-650",
    conditions: "40°C/75%RH",
    points: [
      { month: 0, assay: 100.0, dissolution: 98.8 },
      { month: 3, assay: 99.4, dissolution: 98.2 },
      { month: 6, assay: 98.9, dissolution: 97.6 },
    ],
  },
]

export const training: TrainingRecord[] = [
  { user: "operator.ramesh", skill: "Sterile Handling", validTill: "2025-08-12", status: "Expired" },
  { user: "operator.ramesh", skill: "GMP Basics", validTill: "2026-03-15", status: "Valid" },
  { user: "qa.mahesh", skill: "GMP Basics", validTill: "2026-01-10", status: "Valid" },
  { user: "qa.mahesh", skill: "Deviation Investigation", validTill: "2025-10-20", status: "Expiring Soon" },
  { user: "operator.priya", skill: "Equipment Operation", validTill: "2026-05-30", status: "Valid" },
  { user: "qa.suresh", skill: "Batch Release", validTill: "2025-09-15", status: "Expiring Soon" },
]

export const auditLog: AuditEvent[] = [
  {
    id: "A1",
    entity: "Batch IBU-2025-09-001",
    action: "Reviewed step S2",
    user: "qa.mahesh",
    timestamp: "2025-09-02T15:20:00Z",
    details: "OOS investigation initiated",
  },
  {
    id: "A2",
    entity: "Deviation D-1042",
    action: "CAPA proposed",
    user: "qa.suresh",
    timestamp: "2025-09-03T09:05:00Z",
    details: "Thermocouple calibration scheduled",
  },
  {
    id: "A3",
    entity: "Batch PARA-2025-08-014",
    action: "QC testing completed",
    user: "qa.mahesh",
    timestamp: "2025-08-21T16:30:00Z",
  },
  {
    id: "A4",
    entity: "CoA COA-7781",
    action: "Material quarantined",
    user: "qa.suresh",
    timestamp: "2025-08-16T11:45:00Z",
    details: "Impurity B exceeds specification",
  },
  {
    id: "A5",
    entity: "Training Record",
    action: "Skill expired",
    user: "system",
    timestamp: "2025-08-12T00:00:00Z",
    details: "operator.ramesh - Sterile Handling",
  },
]

export const serialization: SerializationPack[] = [
  {
    batchId: "IBU-2025-09-001",
    gtin: "08904000001234",
    sscc: "180123456789012345",
    sgtins: ["08904000001234210815000001", "08904000001234210815000002", "08904000001234210815000003"],
    status: "Generated",
  },
  {
    batchId: "CS-2025-08-007",
    gtin: "08904000007890",
    sscc: "180123456789012346",
    sgtins: ["08904000007890210805000001", "08904000007890210805000002"],
    status: "Shipped",
  },
]

export const recallSignals: RecallSignal[] = [
  {
    id: "R1",
    productId: "P-CS-100",
    batchId: "CS-2025-08-007",
    state: "UP",
    city: "Lucknow",
    scans: 17,
    status: "Suspected Counterfeit",
    reportedOn: "2025-09-01",
  },
  {
    id: "R2",
    productId: "P-CS-100",
    batchId: "CS-2025-08-007",
    state: "UP",
    city: "Kanpur",
    scans: 9,
    status: "Suspected Counterfeit",
    reportedOn: "2025-09-01",
  },
  {
    id: "R3",
    productId: "P-CS-100",
    batchId: "CS-2025-08-007",
    state: "MH",
    city: "Mumbai",
    scans: 3,
    status: "Duplicate",
    reportedOn: "2025-09-02",
  },
  {
    id: "R4",
    productId: "P-IBU-400",
    batchId: "IBU-2025-09-001",
    state: "KA",
    city: "Bangalore",
    scans: 2,
    status: "Genuine",
    reportedOn: "2025-09-03",
  },
]

// Utility functions for localStorage persistence
export function loadFromLocalOrSeed<T>(key: string, seedData: T[]): T[] {
  if (typeof window === 'undefined') return seedData;
  
  const stored = localStorage.getItem(`shuddhi_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return seedData;
    }
  }
  
  localStorage.setItem(`shuddhi_${key}`, JSON.stringify(seedData));
  return seedData;
}

export function saveToLocal<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`shuddhi_${key}`, JSON.stringify(data));
}

// Mock service delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock failure simulation (5% chance)
export function maybeFail(): void {
  if (Math.random() < 0.05) {
    throw new Error('Network simulation error');
  }
}
