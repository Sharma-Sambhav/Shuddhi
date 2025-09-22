"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Users, CheckCircle, AlertTriangle, Upload, Search, Ban } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listVendors, listCoAs } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { Vendor, CoA } from "@/lib/seed"

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [coas, setCoas] = useState<CoA[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendorData, coaData] = await Promise.all([
          listVendors(),
          listCoAs()
        ])
        setVendors(vendorData)
        setCoas(coaData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleQuarantineMaterial = (coaId: string) => {
    toast.success("Material quarantined successfully")
    // In a real app, this would update the CoA status and potentially affect related batches
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.materials.some(material => material.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">Manage vendors and CoA intelligence</p>
        </div>

        <Tabs defaultValue="vendors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="coa">CoA Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors" className="space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors or materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vendors List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Approved Vendors
                </CardTitle>
                <CardDescription>Manage vendor approvals and material supplies</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Materials Supplied</TableHead>
                      <TableHead>Last Audit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>
                          <Badge className={vendor.approved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {vendor.approved ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approved
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {vendor.materials.map((material, index) => (
                              <Badge key={index} variant="outline" className="mr-1">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {vendor.lastAudit ? new Date(vendor.lastAudit).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" disabled={user?.role === "Auditor"}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coa" className="space-y-4">
            {/* Upload CoA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CoA Upload & Analysis
                </CardTitle>
                <CardDescription>Upload and analyze Certificates of Analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Drag and drop CoA files here, or click to browse
                  </p>
                  <Button disabled={user?.role === "Auditor"}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CoA (CSV/PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CoA Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Recent CoA Analysis</CardTitle>
                <CardDescription>Automated analysis of incoming materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coas.map((coa) => {
                    const vendor = vendors.find(v => v.id === coa.vendorId)
                    const failedParams = coa.params.filter(p => p.status === "Fail")
                    
                    return (
                      <Card key={coa.id} className={failedParams.length > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{coa.material}</h4>
                              <p className="text-sm text-muted-foreground">
                                {vendor?.name} • Lot: {coa.lot} • Received: {new Date(coa.receivedOn).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={failedParams.length > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                              {failedParams.length > 0 ? (
                                <>
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  {failedParams.length} Failed
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  All Passed
                                </>
                              )}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {coa.params.map((param, index) => (
                              <div key={index} className={`p-2 rounded text-sm ${param.status === "Fail" ? "bg-red-100" : "bg-white"}`}>
                                <div className="font-medium">{param.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Spec: {param.min} - {param.max} {param.unit}
                                </div>
                                <div className={`font-semibold ${param.status === "Fail" ? "text-red-600" : "text-green-600"}`}>
                                  {param.value} {param.unit}
                                  {param.status === "Fail" && (
                                    <span className="ml-1 text-red-500">⚠</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {failedParams.length > 0 && (
                            <div className="mt-3 flex items-center justify-between p-2 bg-red-100 rounded">
                              <div className="text-sm text-red-800">
                                <strong>Action Required:</strong> {failedParams.map(p => p.name).join(", ")} out of specification
                              </div>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleQuarantineMaterial(coa.id)}
                                disabled={user?.role === "Auditor"}
                              >
                                <Ban className="mr-1 h-3 w-3" />
                                Quarantine
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}