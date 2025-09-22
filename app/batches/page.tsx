"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, Eye, AlertTriangle, CheckCircle, Clock, Pause } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listBatches, listProducts } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import type { Batch, Product } from "@/lib/seed"

const statusColors = {
  "In Production": "bg-blue-100 text-blue-800",
  "QA Review": "bg-yellow-100 text-yellow-800",
  "In QC": "bg-purple-100 text-purple-800",
  "Released": "bg-green-100 text-green-800",
  "On Hold": "bg-red-100 text-red-800",
}

const statusIcons = {
  "In Production": Clock,
  "QA Review": AlertTriangle,
  "In QC": Package,
  "Released": CheckCircle,
  "On Hold": Pause,
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [marketFilter, setMarketFilter] = useState<string>("all")
  const { user } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [batchData, productData] = await Promise.all([listBatches(), listProducts()])
        setBatches(batchData)
        setProducts(productData)
      } catch (error) {
        console.error("Failed to load batches:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredBatches = batches.filter((batch) => {
    const product = products.find(p => p.id === batch.productId)
    const matchesSearch = batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || batch.status === statusFilter
    const matchesMarket = marketFilter === "all" || batch.market === marketFilter
    
    return matchesSearch && matchesStatus && matchesMarket
  })

  const handleBatchClick = (batchId: string) => {
    router.push(`/batches/${batchId}`)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
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
            <h1 className="text-3xl font-bold">Batch Management</h1>
            <p className="text-muted-foreground">Monitor and manage pharmaceutical batches</p>
          </div>
          <Button disabled={user?.role === "Auditor"}>
            <Package className="mr-2 h-4 w-4" />
            New Batch
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search batches or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Production">In Production</SelectItem>
                  <SelectItem value="QA Review">QA Review</SelectItem>
                  <SelectItem value="In QC">In QC</SelectItem>
                  <SelectItem value="Released">Released</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={marketFilter} onValueChange={setMarketFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  <SelectItem value="Domestic">Domestic</SelectItem>
                  <SelectItem value="Export">Export</SelectItem>
                  <SelectItem value="Domestic+Export">Domestic + Export</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground flex items-center">
                Showing {filteredBatches.length} of {batches.length} batches
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Table */}
        <Card>
          <CardHeader>
            <CardTitle>Batch List</CardTitle>
            <CardDescription>Click on a batch to view details and eBR</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mfg Date</TableHead>
                  <TableHead>Exp Date</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Exceptions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const product = products.find(p => p.id === batch.productId)
                  const StatusIcon = statusIcons[batch.status]
                  
                  return (
                    <TableRow 
                      key={batch.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleBatchClick(batch.id)}
                    >
                      <TableCell className="font-medium">{batch.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product?.name}</div>
                          <div className="text-sm text-muted-foreground">{product?.dosageForm}</div>
                        </div>
                      </TableCell>
                      <TableCell>{batch.size.toLocaleString()} units</TableCell>
                      <TableCell>
                        <Badge className={statusColors[batch.status]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(batch.mfgDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(batch.expDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{batch.market}</Badge>
                      </TableCell>
                      <TableCell>
                        {batch.exceptions ? (
                          <Badge variant="destructive">{batch.exceptions} issues</Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBatchClick(batch.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {filteredBatches.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No batches found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}