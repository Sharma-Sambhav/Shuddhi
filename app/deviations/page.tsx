"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, Clock, Search, Lightbulb, FileSignature, Eye } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listDeviations, createDeviation, updateDeviationStatus } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { Deviation } from "@/lib/seed"

const statusColors = {
  "Open": "bg-red-100 text-red-800 border-red-200",
  "Investigation": "bg-yellow-100 text-yellow-800 border-yellow-200", 
  "CAPA in Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "Closed": "bg-green-100 text-green-800 border-green-200",
}

const severityColors = {
  "Low": "bg-gray-100 text-gray-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "High": "bg-orange-100 text-orange-800",
  "Critical": "bg-red-100 text-red-800",
}

export default function DeviationsPage() {
  const [deviations, setDeviations] = useState<Deviation[]>([])
  const [loading, setLoading] = useState(true)
  const [newDeviationOpen, setNewDeviationOpen] = useState(false)
  const [selectedDeviation, setSelectedDeviation] = useState<Deviation | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // New deviation form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [batchId, setBatchId] = useState("")
  const [type, setType] = useState<"Process" | "Quality" | "Equipment" | "Documentation">("Process")
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("Medium")
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadDeviations = async () => {
      try {
        const data = await listDeviations()
        setDeviations(data)
      } catch (error) {
        console.error("Failed to load deviations:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDeviations()
  }, [])

  const handleCreateDeviation = async () => {
    if (!title || !description || !batchId) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const newDeviation = await createDeviation({
        batchId,
        type,
        title,
        status: "Open",
        openedBy: user?.email || "current.user",
        openedOn: new Date().toISOString().split('T')[0],
        severity,
        aiHints: [
          "Review process parameters and specifications",
          "Check equipment calibration and maintenance records",
          "Verify operator training and competency",
          "Analyze historical data for similar occurrences"
        ]
      })
      
      setDeviations([newDeviation, ...deviations])
      setNewDeviationOpen(false)
      setTitle("")
      setDescription("")
      setBatchId("")
      setType("Process")
      setSeverity("Medium")
      
      toast.success("Deviation created successfully")
    } catch (error) {
      toast.error("Failed to create deviation")
    }
  }

  const handleStatusChange = async (deviationId: string, newStatus: Deviation["status"]) => {
    try {
      await updateDeviationStatus(deviationId, newStatus)
      setDeviations(deviations.map(d => 
        d.id === deviationId ? { ...d, status: newStatus } : d
      ))
      toast.success(`Deviation status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update deviation status")
    }
  }

  const filteredDeviations = deviations.filter(deviation =>
    deviation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deviation.batchId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedDeviations = {
    "Open": filteredDeviations.filter(d => d.status === "Open"),
    "Investigation": filteredDeviations.filter(d => d.status === "Investigation"),
    "CAPA in Progress": filteredDeviations.filter(d => d.status === "CAPA in Progress"),
    "Closed": filteredDeviations.filter(d => d.status === "Closed"),
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
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
            <h1 className="text-3xl font-bold">Deviation Management</h1>
            <p className="text-muted-foreground">Track and manage deviations, CAPAs, and change controls</p>
          </div>
          <Dialog open={newDeviationOpen} onOpenChange={setNewDeviationOpen}>
            <DialogTrigger asChild>
              <Button disabled={user?.role === "Auditor"}>
                <Plus className="mr-2 h-4 w-4" />
                New Deviation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Deviation</DialogTitle>
                <DialogDescription>
                  Document a deviation from standard operating procedures
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch">Batch ID</Label>
                    <Input
                      id="batch"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      placeholder="e.g., IBU-2025-09-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(value: any) => setType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Process">Process</SelectItem>
                        <SelectItem value="Quality">Quality</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the deviation"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of what happened, when, and potential impact"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewDeviationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDeviation}>Create Deviation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(groupedDeviations).map(([status, items]) => (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{status}</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deviations by title or batch ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {Object.entries(groupedDeviations).map(([status, items]) => (
            <Card key={status} className={`${statusColors[status as keyof typeof statusColors]} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {status}
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((deviation) => (
                  <Card key={deviation.id} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm leading-tight">{deviation.title}</h4>
                          <Badge className={severityColors[deviation.severity]} variant="secondary">
                            {deviation.severity}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Batch: {deviation.batchId}</p>
                          <p>Type: {deviation.type}</p>
                          <p>Opened: {new Date(deviation.openedOn).toLocaleDateString()}</p>
                          <p>By: {deviation.openedBy}</p>
                        </div>

                        {deviation.aiHints && deviation.aiHints.length > 0 && (
                          <div className="bg-blue-50 p-2 rounded text-xs">
                            <div className="flex items-center gap-1 mb-1">
                              <Lightbulb className="h-3 w-3 text-blue-600" />
                              <span className="font-medium text-blue-800">AI Hints:</span>
                            </div>
                            <ul className="text-blue-700 space-y-1">
                              {deviation.aiHints.slice(0, 2).map((hint, index) => (
                                <li key={index} className="text-xs">• {hint}</li>
                              ))}
                              {deviation.aiHints.length > 2 && (
                                <li className="text-xs text-blue-600">+{deviation.aiHints.length - 2} more...</li>
                              )}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {Math.ceil((Date.now() - new Date(deviation.openedOn).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDeviation(deviation)
                                setDetailsOpen(true)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            
                            {deviation.status !== "Closed" && user?.role !== "Auditor" && (
                              <Select
                                value={deviation.status}
                                onValueChange={(newStatus: any) => handleStatusChange(deviation.id, newStatus)}
                              >
                                <SelectTrigger className="h-6 w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Open">Open</SelectItem>
                                  <SelectItem value="Investigation">Investigation</SelectItem>
                                  <SelectItem value="CAPA in Progress">CAPA</SelectItem>
                                  <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No deviations in {status.toLowerCase()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deviation Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {selectedDeviation?.title}
              </DialogTitle>
              <DialogDescription>
                Deviation ID: {selectedDeviation?.id} • Batch: {selectedDeviation?.batchId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDeviation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm">{selectedDeviation.type}</p>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Badge className={severityColors[selectedDeviation.severity]}>
                      {selectedDeviation.severity}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={statusColors[selectedDeviation.status]}>
                      {selectedDeviation.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Opened By</Label>
                    <p className="text-sm">{selectedDeviation.openedBy}</p>
                  </div>
                </div>

                <div>
                  <Label>AI-Generated Investigation Hints</Label>
                  <div className="bg-blue-50 p-3 rounded mt-2">
                    <ul className="space-y-2">
                      {selectedDeviation.aiHints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <FileSignature className="mr-2 h-4 w-4" />
                    Add CAPA
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Assign Investigator
                  </Button>
                  {selectedDeviation.status !== "Closed" && user?.role !== "Auditor" && (
                    <Button 
                      onClick={() => handleStatusChange(selectedDeviation.id, "Closed")}
                      className="flex-1"
                    >
                      Close Deviation
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}