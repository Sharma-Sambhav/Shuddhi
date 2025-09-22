"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  FileSignature, 
  Download, 
  Plus,
  Eye,
  Clock,
  User,
  Calendar,
  Package
} from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { getBatch, getEBRSteps, listProducts, createDeviation, approveEBRSteps } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { Batch, Product, EBRStep } from "@/lib/seed"

const stepStatusColors = {
  "OK": "bg-green-100 text-green-800",
  "OOT": "bg-yellow-100 text-yellow-800", 
  "OOS": "bg-red-100 text-red-800",
}

const stepStatusIcons = {
  "OK": CheckCircle,
  "OOT": AlertTriangle,
  "OOS": AlertTriangle,
}

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.id as string
  
  const [batch, setBatch] = useState<Batch | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [ebrSteps, setEbrSteps] = useState<EBRStep[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSteps, setSelectedSteps] = useState<string[]>([])
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [deviationDialogOpen, setDeviationDialogOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [deviationTitle, setDeviationTitle] = useState("")
  const [deviationDescription, setDeviationDescription] = useState("")
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadBatchData = async () => {
      try {
        const [batchData, stepsData, productsData] = await Promise.all([
          getBatch(batchId),
          getEBRSteps(batchId),
          listProducts()
        ])
        
        setBatch(batchData)
        setEbrSteps(stepsData)
        
        const productData = productsData.find(p => p.id === batchData.productId)
        setProduct(productData || null)
      } catch (error) {
        console.error("Failed to load batch data:", error)
        toast.error("Failed to load batch data")
      } finally {
        setLoading(false)
      }
    }

    if (batchId) {
      loadBatchData()
    }
  }, [batchId])

  const handleStepSelection = (stepId: string, checked: boolean) => {
    if (checked) {
      setSelectedSteps([...selectedSteps, stepId])
    } else {
      setSelectedSteps(selectedSteps.filter(id => id !== stepId))
    }
  }

  const handleApproveSteps = async () => {
    if (selectedSteps.length === 0) {
      toast.error("Please select steps to approve")
      return
    }

    if (!password) {
      toast.error("Please enter your password for e-signature")
      return
    }

    try {
      await approveEBRSteps(batchId, selectedSteps)
      toast.success(`Approved ${selectedSteps.length} eBR steps`)
      setSignatureDialogOpen(false)
      setPassword("")
      setSelectedSteps([])
      
      // Reload data
      const stepsData = await getEBRSteps(batchId)
      setEbrSteps(stepsData)
    } catch (error) {
      toast.error("Failed to approve steps")
    }
  }

  const handleCreateDeviation = async () => {
    if (!deviationTitle || !deviationDescription) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      await createDeviation({
        batchId,
        type: "Process",
        title: deviationTitle,
        status: "Open",
        openedBy: user?.email || "current.user",
        openedOn: new Date().toISOString().split('T')[0],
        severity: "Medium",
        aiHints: [
          "Review process parameters",
          "Check equipment calibration",
          "Verify operator training"
        ]
      })
      
      toast.success("Deviation created successfully")
      setDeviationDialogOpen(false)
      setDeviationTitle("")
      setDeviationDescription("")
    } catch (error) {
      toast.error("Failed to create deviation")
    }
  }

  const generateReleasePacket = () => {
    toast.success("Release packet generated successfully")
    // Mock PDF download
    const link = document.createElement('a')
    link.href = '#'
    link.download = `Release_Packet_${batchId}.pdf`
    link.click()
  }

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

  if (!batch || !product) {
    return (
      <AppShell>
        <div className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Batch not found</h3>
            <Button onClick={() => router.push("/batches")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Batches
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  const exceptionsCount = ebrSteps.filter(step => step.status !== "OK").length
  

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/batches")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{batch.id}</h1>
              <p className="text-muted-foreground">{product.name} - {product.dosageForm}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={stepStatusColors[batch.status as keyof typeof stepStatusColors] || "bg-gray-100 text-gray-800"}>
              {batch.status}
            </Badge>
            <Button onClick={generateReleasePacket} disabled={user?.role === "Auditor"}>
              <Download className="mr-2 h-4 w-4" />
              Generate Release Packet
            </Button>
          </div>
        </div>

        {/* Batch Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Batch Size</p>
                  <p className="font-semibold">{batch.size.toLocaleString()} units</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mfg Date</p>
                  <p className="font-semibold">{new Date(batch.mfgDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Exp Date</p>
                  <p className="font-semibold">{new Date(batch.expDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Exceptions</p>
                  <p className="font-semibold text-red-600">{exceptionsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exception Banner */}
        {exceptionsCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">
                      {exceptionsCount} Exception{exceptionsCount > 1 ? 's' : ''} Require Attention
                    </p>
                    <p className="text-sm text-red-600">
                      Review out-of-specification and out-of-trend parameters below
                    </p>
                  </div>
                </div>
                <Dialog open={deviationDialogOpen} onOpenChange={setDeviationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={user?.role === "Auditor"}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Deviation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Deviation</DialogTitle>
                      <DialogDescription>
                        Create a deviation for the exceptions found in this batch
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Deviation Title</Label>
                        <Input
                          id="title"
                          value={deviationTitle}
                          onChange={(e) => setDeviationTitle(e.target.value)}
                          placeholder="Enter deviation title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={deviationDescription}
                          onChange={(e) => setDeviationDescription(e.target.value)}
                          placeholder="Describe the deviation and its impact"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeviationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateDeviation}>Create Deviation</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="ebr" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ebr">eBR Steps</TabsTrigger>
            <TabsTrigger value="qc">QC Results</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="signatures">Signatures</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="ebr" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Electronic Batch Record</CardTitle>
                    <CardDescription>Review-by-exception for critical parameters</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedSteps.length} selected
                    </span>
                    <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={selectedSteps.length === 0 || user?.role === "Auditor"}
                        >
                          <FileSignature className="mr-2 h-4 w-4" />
                          Approve Selected
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Electronic Signature Required</DialogTitle>
                          <DialogDescription>
                            Please re-enter your password to approve {selectedSteps.length} eBR step{selectedSteps.length > 1 ? 's' : ''}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                            />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>User: {user?.name}</p>
                            <p>Role: {user?.role}</p>
                            <p>Timestamp: {new Date().toLocaleString()}</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleApproveSteps}>
                            <FileSignature className="mr-2 h-4 w-4" />
                            Apply Signature
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Step</TableHead>
                      <TableHead>Specification</TableHead>
                      <TableHead>Actual Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ebrSteps.map((step) => {
                      const StatusIcon = stepStatusIcons[step.status]
                      
                      return (
                        <TableRow key={step.id} className={step.status !== "OK" ? "bg-red-50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSteps.includes(step.id)}
                              onCheckedChange={(checked) => handleStepSelection(step.id, checked as boolean)}
                              disabled={user?.role === "Auditor"}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{step.step}</div>
                              {step.comments && (
                                <div className="text-sm text-muted-foreground mt-1">{step.comments}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {step.specMin} - {step.specMax} {step.unit}
                          </TableCell>
                          <TableCell className={step.status !== "OK" ? "font-semibold text-red-600" : ""}>
                            {step.value} {step.unit}
                          </TableCell>
                          <TableCell>
                            <Badge className={stepStatusColors[step.status]}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {step.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {step.user}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(step.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qc">
            <Card>
              <CardHeader>
                <CardTitle>QC Test Results</CardTitle>
                <CardDescription>Quality control testing results and certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">QC results will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>Supporting documents and files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Attachments will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signatures">
            <Card>
              <CardHeader>
                <CardTitle>Electronic Signatures</CardTitle>
                <CardDescription>Signature history and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Signature history will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Complete audit trail for this batch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Audit trail will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}