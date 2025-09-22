"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScanLine, MapPin, AlertTriangle, CheckCircle, Download, Search, Shield } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listRecallSignals, simulateScan } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { RecallSignal } from "@/lib/seed"

const statusColors = {
  "Genuine": "bg-green-100 text-green-800",
  "Suspected Counterfeit": "bg-red-100 text-red-800",
  "Duplicate": "bg-yellow-100 text-yellow-800",
  "Not Found": "bg-gray-100 text-gray-800",
}

const statusIcons = {
  "Genuine": CheckCircle,
  "Suspected Counterfeit": AlertTriangle,
  "Duplicate": AlertTriangle,
  "Not Found": Search,
}

// Simple India map representation
const IndiaMap = ({ signals }: { signals: RecallSignal[] }) => {
  const stateIncidents = signals.reduce((acc, signal) => {
    acc[signal.state] = (acc[signal.state] || 0) + (signal.status === "Suspected Counterfeit" ? signal.scans : 0)
    return acc
  }, {} as Record<string, number>)

  const maxIncidents = Math.max(...Object.values(stateIncidents), 1)

  const states = [
    { name: "UP", x: 300, y: 200, incidents: stateIncidents["UP"] || 0 },
    { name: "MH", x: 250, y: 300, incidents: stateIncidents["MH"] || 0 },
    { name: "KA", x: 250, y: 400, incidents: stateIncidents["KA"] || 0 },
    { name: "TN", x: 280, y: 450, incidents: stateIncidents["TN"] || 0 },
    { name: "GJ", x: 200, y: 250, incidents: stateIncidents["GJ"] || 0 },
    { name: "RJ", x: 220, y: 180, incidents: stateIncidents["RJ"] || 0 },
    { name: "WB", x: 380, y: 220, incidents: stateIncidents["WB"] || 0 },
    { name: "AP", x: 320, y: 380, incidents: stateIncidents["AP"] || 0 },
  ]

  return (
    <div className="relative w-full h-96 bg-blue-50 rounded-lg overflow-hidden">
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {/* India outline (simplified) */}
        <path
          d="M150 150 L400 150 L420 200 L400 250 L380 300 L350 350 L320 400 L280 450 L250 480 L200 470 L150 450 L120 400 L100 350 L110 300 L130 250 L140 200 Z"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="2"
        />
        
        {/* State markers */}
        {states.map((state) => {
          const intensity = state.incidents / maxIncidents
          const color = intensity > 0.7 ? "#dc2626" : intensity > 0.3 ? "#f59e0b" : "#10b981"
          const size = Math.max(8, intensity * 20)
          
          return (
            <g key={state.name}>
              <circle
                cx={state.x}
                cy={state.y}
                r={size}
                fill={color}
                opacity={0.7}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={state.x}
                y={state.y + 4}
                textAnchor="middle"
                className="text-xs font-semibold fill-white"
              >
                {state.name}
              </text>
              {state.incidents > 0 && (
                <text
                  x={state.x}
                  y={state.y + 25}
                  textAnchor="middle"
                  className="text-xs font-bold fill-red-600"
                >
                  {state.incidents}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <h4 className="text-sm font-semibold mb-2">Counterfeit Incidents</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Low (0-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs">Medium (6-15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">High (16+)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecallPage() {
  const [signals, setSignals] = useState<RecallSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [qrInput, setQrInput] = useState("")
  const [scanResults, setScanResults] = useState<any[]>([])
  const [recallDialogOpen, setRecallDialogOpen] = useState(false)
  const [recallReason, setRecallReason] = useState("")
  const [affectedStates, setAffectedStates] = useState("")
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const data = await listRecallSignals()
        setSignals(data)
      } catch (error) {
        console.error("Failed to load recall signals:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSignals()
  }, [])

  const handleScan = async () => {
    if (!qrInput.trim()) {
      toast.error("Please enter a QR code or SGTIN to scan")
      return
    }

    try {
      const result = await simulateScan(qrInput)
      setScanResults([result, ...scanResults.slice(0, 9)]) // Keep last 10 results
      
      if (result.status === "Suspected Counterfeit") {
        toast.error("⚠️ Counterfeit product detected!")
      } else if (result.status === "Duplicate") {
        toast.warning("⚠️ Duplicate scan detected")
      } else if (result.status === "Genuine") {
        toast.success("✅ Genuine product verified")
      } else {
        toast.error("❌ Product not found in database")
      }
      
      setQrInput("")
    } catch (error) {
      toast.error("Failed to process scan")
    }
  }

  const generateRecallNotice = () => {
    if (!recallReason || !affectedStates) {
      toast.error("Please fill in all fields")
      return
    }

    // Calculate impact
    const affectedSignals = signals.filter(s => 
      s.status === "Suspected Counterfeit" && 
      affectedStates.split(",").map(s => s.trim().toUpperCase()).includes(s.state)
    )
    
    const totalScans = affectedSignals.reduce((sum, s) => sum + s.scans, 0)
    const estimatedRecall = totalScans * 50 // Assume 50 units per scan location
    const totalProduced = 200000 // From seed data
    const recallPercentage = ((estimatedRecall / totalProduced) * 100).toFixed(1)

    // Mock PDF generation
    const recallData = {
      date: new Date().toLocaleDateString(),
      reason: recallReason,
      affectedStates: affectedStates,
      estimatedUnits: estimatedRecall,
      totalProduced: totalProduced,
      percentage: recallPercentage,
      moneySaved: ((totalProduced - estimatedRecall) * 25).toLocaleString() // ₹25 per unit
    }

    // Simulate PDF download
    const link = document.createElement('a')
    link.href = '#'
    link.download = `Targeted_Recall_Notice_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()

    toast.success(`Targeted recall notice generated! Only ${recallPercentage}% of production affected (${estimatedRecall.toLocaleString()} units)`)
    setRecallDialogOpen(false)
    setRecallReason("")
    setAffectedStates("")
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </AppShell>
    )
  }

  const counterfeitSignals = signals.filter(s => s.status === "Suspected Counterfeit")
  const totalCounterfeitScans = counterfeitSignals.reduce((sum, s) => sum + s.scans, 0)

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recall & Field Intelligence</h1>
            <p className="text-muted-foreground">Track product authenticity and manage targeted recalls</p>
          </div>
          <Dialog open={recallDialogOpen} onOpenChange={setRecallDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={user?.role === "Auditor" || counterfeitSignals.length === 0}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Create Targeted Recall
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Targeted Recall Notice</DialogTitle>
                <DialogDescription>
                  Generate a targeted recall notice for affected regions only
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Recall Reason</Label>
                  <Textarea
                    id="reason"
                    value={recallReason}
                    onChange={(e) => setRecallReason(e.target.value)}
                    placeholder="Describe the reason for recall (e.g., counterfeit products detected in specific regions)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="states">Affected States</Label>
                  <Input
                    id="states"
                    value={affectedStates}
                    onChange={(e) => setAffectedStates(e.target.value)}
                    placeholder="e.g., UP, MH (comma-separated)"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Impact Estimate:</strong> Based on current signals, this targeted recall will affect approximately {totalCounterfeitScans * 50} units instead of the entire batch of 200,000 units.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRecallDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateRecallNotice}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Notice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold">{signals.reduce((sum, s) => sum + s.scans, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Genuine</p>
                  <p className="text-2xl font-bold text-green-600">
                    {signals.filter(s => s.status === "Genuine").reduce((sum, s) => sum + s.scans, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Counterfeit</p>
                  <p className="text-2xl font-bold text-red-600">{totalCounterfeitScans}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Affected States</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Set(counterfeitSignals.map(s => s.state)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scan Simulator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>Simulate scanning QR codes or SGTINs for authenticity verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter QR code data or SGTIN..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleScan()}
                />
                <Button onClick={handleScan}>
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Recent Scan Results</h4>
                {scanResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scans yet. Try scanning a QR code above.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {scanResults.map((result, index) => {
                      const StatusIcon = statusIcons[result.status as keyof typeof statusIcons]
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-mono">{result.qrCode.slice(0, 20)}...</span>
                          </div>
                          <Badge className={statusColors[result.status as keyof typeof statusColors]}>
                            {result.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Field Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Field Intelligence
              </CardTitle>
              <CardDescription>Real-time counterfeit detection signals from the field</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals.slice(0, 5).map((signal) => {
                    const StatusIcon = statusIcons[signal.status]
                    return (
                      <TableRow key={signal.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{signal.city}</div>
                            <div className="text-sm text-muted-foreground">{signal.state}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{signal.batchId}</TableCell>
                        <TableCell>{signal.scans}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[signal.status]}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {signal.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* India Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Counterfeit Detection Heatmap
            </CardTitle>
            <CardDescription>
              Geographic distribution of counterfeit incidents across India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IndiaMap signals={signals} />
            
            {counterfeitSignals.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Counterfeit Alert</h4>
                </div>
                <p className="text-sm text-red-700">
                  {counterfeitSignals.length} counterfeit incidents detected across {new Set(counterfeitSignals.map(s => s.state)).size} states. 
                  Targeted recall recommended for affected regions only.
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <strong>Impact:</strong> Only {((totalCounterfeitScans * 50 / 200000) * 100).toFixed(1)}% of total production affected 
                  ({(totalCounterfeitScans * 50).toLocaleString()} units out of 200,000)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}