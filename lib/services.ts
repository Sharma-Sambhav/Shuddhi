import {
  products,
  batches,
  ebrSteps,
  deviations,
  vendors,
  coas,
  stabilityStudies,
  training,
  auditLog,
  serialization,
  recallSignals,
  loadFromLocalOrSeed,
  saveToLocal,
  delay,
  maybeFail,
  type Batch,
  type Deviation,
  type AuditEvent,
} from "./seed"

// Batch Services
export async function listBatches() {
  await delay(400)
  maybeFail()
  return loadFromLocalOrSeed("batches", batches)
}

export async function getBatch(id: string) {
  await delay(300)
  maybeFail()
  const allBatches = loadFromLocalOrSeed("batches", batches)
  const batch = allBatches.find((b) => b.id === id)
  if (!batch) throw new Error("Batch not found")
  return batch
}

export async function getBatchById(id: string) {
  return getBatch(id)
}

export async function updateBatchStatus(id: string, status: Batch["status"]) {
  await delay(500)
  maybeFail()
  const allBatches = loadFromLocalOrSeed("batches", batches)
  const batchIndex = allBatches.findIndex((b) => b.id === id)
  if (batchIndex === -1) throw new Error("Batch not found")

  allBatches[batchIndex].status = status
  saveToLocal("batches", allBatches)

  // Log the action
  const newAuditEvent: AuditEvent = {
    id: `A${Date.now()}`,
    entity: `Batch ${id}`,
    action: `Status changed to ${status}`,
    user: "current.user",
    timestamp: new Date().toISOString(),
  }
  await logAuditEvent(newAuditEvent)

  return allBatches[batchIndex]
}

// eBR Services
export async function getEBRSteps(batchId: string) {
  await delay(350)
  maybeFail()
  const allSteps = loadFromLocalOrSeed("ebrSteps", ebrSteps)
  return allSteps.filter((step) => step.batchId === batchId)
}

export async function approveEBRSteps(batchId: string, stepIds: string[]) {
  await delay(600)
  maybeFail()

  const newAuditEvent: AuditEvent = {
    id: `A${Date.now()}`,
    entity: `Batch ${batchId}`,
    action: `Approved ${stepIds.length} eBR steps`,
    user: "current.user",
    timestamp: new Date().toISOString(),
    details: `Steps: ${stepIds.join(", ")}`,
  }
  await logAuditEvent(newAuditEvent)

  return { success: true, approvedSteps: stepIds.length }
}

// Deviation Services
export async function listDeviations() {
  await delay(400)
  maybeFail()
  return loadFromLocalOrSeed("deviations", deviations)
}

export async function createDeviation(deviation: Omit<Deviation, "id">) {
  await delay(500)
  maybeFail()

  const allDeviations = loadFromLocalOrSeed("deviations", deviations)
  const newDeviation: Deviation = {
    ...deviation,
    id: `D-${Date.now()}`,
  }

  allDeviations.push(newDeviation)
  saveToLocal("deviations", allDeviations)

  const newAuditEvent: AuditEvent = {
    id: `A${Date.now()}`,
    entity: `Deviation ${newDeviation.id}`,
    action: "Created deviation",
    user: "current.user",
    timestamp: new Date().toISOString(),
    details: newDeviation.title,
  }
  await logAuditEvent(newAuditEvent)

  return newDeviation
}

export async function updateDeviationStatus(id: string, status: Deviation["status"]) {
  await delay(500)
  maybeFail()

  const allDeviations = loadFromLocalOrSeed("deviations", deviations)
  const deviationIndex = allDeviations.findIndex((d) => d.id === id)
  if (deviationIndex === -1) throw new Error("Deviation not found")

  allDeviations[deviationIndex].status = status
  saveToLocal("deviations", allDeviations)

  const newAuditEvent: AuditEvent = {
    id: `A${Date.now()}`,
    entity: `Deviation ${id}`,
    action: `Status changed to ${status}`,
    user: "current.user",
    timestamp: new Date().toISOString(),
  }
  await logAuditEvent(newAuditEvent)

  return allDeviations[deviationIndex]
}

// Product Services
export async function listProducts() {
  await delay(300)
  maybeFail()
  return loadFromLocalOrSeed("products", products)
}

// Vendor & CoA Services
export async function listVendors() {
  await delay(350)
  maybeFail()
  return loadFromLocalOrSeed("vendors", vendors)
}

export async function listCoAs() {
  await delay(400)
  maybeFail()
  return loadFromLocalOrSeed("coas", coas)
}

// Stability Services
export async function listStabilityStudies() {
  await delay(400)
  maybeFail()
  return loadFromLocalOrSeed("stabilityStudies", stabilityStudies)
}

// Training Services
export async function listTrainingRecords() {
  await delay(350)
  maybeFail()
  return loadFromLocalOrSeed("training", training)
}

// Audit Services
export async function getAuditLog() {
  await delay(300)
  maybeFail()
  return loadFromLocalOrSeed("auditLog", auditLog)
}

export async function logAuditEvent(event: AuditEvent) {
  await delay(200)
  const allEvents = loadFromLocalOrSeed("auditLog", auditLog)
  allEvents.unshift(event) // Add to beginning
  saveToLocal("auditLog", allEvents)
  return event
}

// Serialization Services
export async function listSerializationPacks() {
  await delay(400)
  maybeFail()
  return loadFromLocalOrSeed("serialization", serialization)
}

export async function generateSerializationPack(batchId: string, gtin: string, quantity = 1000) {
  await delay(800)
  maybeFail()

  const sscc = `18012345678901${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
  const sgtins = Array.from(
    { length: Math.min(quantity, 100) },
    (_, i) =>
      `${gtin}21${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${(i + 1).toString().padStart(6, "0")}`,
  )

  const pack = {
    batchId,
    gtin,
    sscc,
    sgtins,
    status: "Generated" as const,
  }

  const allPacks = loadFromLocalOrSeed("serialization", serialization)
  allPacks.push(pack)
  saveToLocal("serialization", allPacks)

  return pack
}

// Recall Services
export async function listRecallSignals() {
  await delay(400)
  maybeFail()
  return loadFromLocalOrSeed("recallSignals", recallSignals)
}

export async function simulateScan(qrCode: string) {
  await delay(600)
  maybeFail()

  // Simple simulation logic
  const isValid = qrCode.length > 10 && !qrCode.includes("fake")
  const isDuplicate = Math.random() < 0.1

  let status: "Genuine" | "Suspected Counterfeit" | "Duplicate" | "Not Found"
  if (!isValid) {
    status = "Not Found"
  } else if (isDuplicate) {
    status = "Duplicate"
  } else if (Math.random() < 0.2) {
    status = "Suspected Counterfeit"
  } else {
    status = "Genuine"
  }

  return {
    qrCode,
    status,
    timestamp: new Date().toISOString(),
    location: "Simulated Location",
  }
}

// Dashboard Services
export async function getDashboardStats() {
  await delay(500)
  maybeFail()

  const allBatches = loadFromLocalOrSeed("batches", batches)
  const allDeviations = loadFromLocalOrSeed("deviations", deviations)
  const allTraining = loadFromLocalOrSeed("training", training)

  return {
    batchesInQA: allBatches.filter((b) => b.status === "QA Review").length,
    readyToRelease: allBatches.filter((b) => b.status === "Released").length,
    openDeviations: allDeviations.filter((d) => d.status === "Open").length,
    trainingExpiring: allTraining.filter((t) => t.status === "Expiring Soon" || t.status === "Expired").length,
    complianceAlerts: 2, // Mock compliance alerts
    releaseLeadTime: [
      { batch: "IBU-001", days: 21 },
      { batch: "PARA-014", days: 18 },
      { batch: "CS-007", days: 15 },
      { batch: "AMX-003", days: 12 },
      { batch: "CET-012", days: 8 },
      { batch: "IBU-002", days: 3 },
    ],
    yieldData: [
      { batch: "IBU-001", expected: 1000000, actual: 985000 },
      { batch: "PARA-014", expected: 800000, actual: 795000 },
      { batch: "CS-007", expected: 200000, actual: 198500 },
      { batch: "AMX-003", expected: 500000, actual: 502000 },
      { batch: "CET-012", expected: 750000, actual: 745000 },
    ],
  }
}
