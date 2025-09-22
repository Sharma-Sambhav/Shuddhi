"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileSignature, Search, Download, Filter, Eye, CheckCircle, AlertTriangle } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { getAuditLog } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { AuditEvent } from "@/lib/seed"

const prebuiltQueries = [
  {
    id: "deviations-injectables",
    title: "Deviations for Injectables (Last 6 Months)",
    description: "Show all deviations related to injectable products in the last 6 months",
    count: 3
  },
  {
    id: "expired-trainings",
    title: "Expired Training Records",
    description: "Show all users with expired training certifications",
    count: 2
  },
  {
    id: "coa-failures",
    title: "CoA Failures (Last Quarter)",
    description: "Show all Certificate of Analysis failures in the last quarter",
    count: 1
  },
  {
    id: "batch-exceptions",
    title: "Batch Exceptions (High Severity)",
    description: "Show all high severity batch exceptions requiring investigation",
    count: 5
  },
  {
    id: "signature-trail",
    title: "Electronic Signature Trail",
    description: "Complete trail of all electronic signatures applied",
    count: 24
  }
]

export default function AuditPage() {
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [releasePacketOpen, setReleasePacketOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState("IBU-2025-09-001")
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        const data = await getAuditLog()
        setAuditLog(data)
      } catch (error) {
        console.error("Failed to load audit log:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAuditLog()
  }, [])

  const handleSearch = (query: string) => {
    setSearchTerm(query)
    toast.success(`Searching for: ${query}`)
  }

  const generateReleasePacket = () => {
    // Mock release packet generation
    const packetContents = [
      "Batch Manufacturing Record (eBR)",
      "Quality Control Test Results",
      "Deviation Reports & CAPAs",
      "Electronic Signatures Log",
      "Material CoA Certificates",
      "Environmental Monitoring Data",
      "Equipment Calibration Records",
      "Training Records Verification",
      "Label Proofs & Artwork",
      "Stability Study Data"
    ]

    toast.success("Release packet generated successfully")
    
    // Simulate PDF download
    const link = document.createElement('a')
    link.href = '#'
    link.download = `Release_Packet_${selectedBatch}.pdf`
    link.click()
    
    setReleasePacketOpen(false)
  }

  const filteredAuditLog = auditLog.filter(event =>
    event.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.user.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AppShell>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Assistant</h1>
            <p className="text-muted-foreground">Comprehensive audit trail and documentation management</p>
          </div>
          <Dialog open={releasePacketOpen} onOpenChange={setReleasePacketOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileSignature className="mr-2 h-4 w-4" />
                Assemble Release Packet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assemble Release Packet</DialogTitle>
                <DialogDescription>
                  Generate a comprehensive release packet with all required documentation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Batch ID</label>
                  <Input
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    placeholder="Enter batch ID"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Documents to Include:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Batch Manufacturing Record (eBR)",
                      "Quality Control Test Results", 
                      "Deviation Reports & CAPAs",
                      "Electronic Signatures Log",
                      "Material CoA Certificates",
                      "Environmental Monitoring Data",
                      "Equipment Calibration Records",
                      "Training Records Verification",
                      "Label Proofs & Artwork",
                      "Stability Study Data"
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Packet Summary:</strong> 10 documents, 156 pages, digitally signed and timestamped.
                    Ready for regulatory submission.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReleasePacketOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateReleasePacket}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Global Search
            </CardTitle>
            <CardDescription>Search across all batches, deviations, training records, and audit events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit trail, batches, deviations, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Prebuilt Queries</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {prebuiltQueries.map((query) => (
                  <Card key={query.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSearch(query.title)}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{query.title}</h5>
                        <Badge variant="secondary">{query.count}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{query.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Audit Ready</p>
                  <p className="text-2xl font-bold text-green-600">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Missing Documents</p>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Open Observations</p>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Complete chronological record of all system activities
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditLog.slice(0, 20).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{event.entity}</TableCell>
                    <TableCell>{event.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.user}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.details || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredAuditLog.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Observations */}
        <Card>
          <CardHeader>
            <CardTitle>Open Audit Observations</CardTitle>
            <CardDescription>Items requiring attention for audit readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">Training Record Missing</h4>
                  <p className="text-sm text-yellow-700">
                    Operator 12 (operator.ramesh) missing current Sterile Handling certification - flagged Jan 2024
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Impact: Cannot sign sterile product eBR steps until renewed
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Resolve
                </Button>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">Deviation CAPA Pending</h4>
                  <p className="text-sm text-yellow-700">
                    Deviation D-1042 CAPA implementation pending closure - flagged Feb 2024
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Impact: Batch release may be delayed pending CAPA effectiveness verification
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}