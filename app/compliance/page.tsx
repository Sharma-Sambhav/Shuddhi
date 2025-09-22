"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Shield, QrCode, Package, Download, CheckCircle, AlertTriangle } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listProducts, listBatches, generateSerializationPack } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import QRCode from "qrcode"
import type { Product, Batch } from "@/lib/seed"

const scheduleM2023Clauses = [
  { id: "premises", title: "Premises & Equipment", completion: 85, status: "In Progress" },
  { id: "documentation", title: "Documentation", completion: 92, status: "Compliant" },
  { id: "production", title: "Production", completion: 78, status: "In Progress" },
  { id: "quality", title: "Quality Control", completion: 95, status: "Compliant" },
  { id: "storage", title: "Storage & Distribution", completion: 88, status: "Compliant" },
  { id: "personnel", title: "Personnel", completion: 90, status: "Compliant" },
]

export default function CompliancePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [mrp, setMrp] = useState("")
  const [licenseNo, setLicenseNo] = useState("MFG/25/001234")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [serialQuantity, setSerialQuantity] = useState("1000")
  const [loading, setLoading] = useState(false)
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, batchData] = await Promise.all([
          listProducts(),
          listBatches()
        ])
        setProducts(productData)
        setBatches(batchData)
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }
    loadData()
  }, [])

  const generateH2QR = async () => {
    if (!selectedProduct || !selectedBatch || !mrp) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const product = products.find(p => p.id === selectedProduct)
      const batch = batches.find(b => b.id === selectedBatch)
      
      if (!product || !batch) {
        toast.error("Invalid product or batch selection")
        return
      }

      // Generate H2 QR code data
      const qrData = {
        gtin: product.gtin,
        batch: batch.id,
        exp: batch.expDate.replace(/-/g, ""),
        mrp: mrp,
        mfg: batch.mfgDate.replace(/-/g, ""),
        license: licenseNo
      }

      const qrString = `01${qrData.gtin}10${qrData.batch}17${qrData.exp}15${qrData.mfg}30${qrData.mrp}91${qrData.license}`
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeUrl(qrCodeDataUrl)
      toast.success("H2 QR code generated successfully")
    } catch (error) {
      toast.error("Failed to generate QR code")
    } finally {
      setLoading(false)
    }
  }

  const exportQRCodes = () => {
    if (!qrCodeUrl) {
      toast.error("Please generate QR code first")
      return
    }

    // Mock CSV export
    const csvContent = `Serial,GTIN,Batch,QR_Data,QR_Image_URL
1,${products.find(p => p.id === selectedProduct)?.gtin},${selectedBatch},Sample_QR_Data_1,${qrCodeUrl}
2,${products.find(p => p.id === selectedProduct)?.gtin},${selectedBatch},Sample_QR_Data_2,${qrCodeUrl}
3,${products.find(p => p.id === selectedProduct)?.gtin},${selectedBatch},Sample_QR_Data_3,${qrCodeUrl}`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `H2_QR_Codes_${selectedBatch}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("QR codes exported to CSV")
  }

  const generateSerialization = async () => {
    if (!selectedProduct || !selectedBatch) {
      toast.error("Please select product and batch")
      return
    }

    setLoading(true)
    try {
      const product = products.find(p => p.id === selectedProduct)
      if (!product) {
        toast.error("Invalid product selection")
        return
      }

      const pack = await generateSerializationPack(
        selectedBatch,
        product.gtin,
        parseInt(serialQuantity)
      )
      
      toast.success(`Generated serialization pack with SSCC: ${pack.sscc}`)
    } catch (error) {
      toast.error("Failed to generate serialization pack")
    } finally {
      setLoading(false)
    }
  }

  const exportSerialization = () => {
    if (!selectedProduct || !selectedBatch) {
      toast.error("Please select product and batch first")
      return
    }

    // Mock serialization CSV export
    const product = products.find(p => p.id === selectedProduct)
    const csvContent = `SGTIN,GTIN,Serial,Batch,Status
${product?.gtin}210815000001,${product?.gtin},000001,${selectedBatch},Generated
${product?.gtin}210815000002,${product?.gtin},000002,${selectedBatch},Generated
${product?.gtin}210815000003,${product?.gtin},000003,${selectedBatch},Generated`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `GS1_Serialization_${selectedBatch}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("Serialization data exported to CSV")
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance Management</h1>
          <p className="text-muted-foreground">Schedule M 2023, H2 QR codes, and GS1 serialization</p>
        </div>

        <Tabs defaultValue="schedule-m" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule-m">Schedule M 2023</TabsTrigger>
            <TabsTrigger value="h2-qr">H2 QR Generator</TabsTrigger>
            <TabsTrigger value="gs1">GS1 Serialization</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule-m" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Schedule M 2023 Compliance
                </CardTitle>
                <CardDescription>
                  Track compliance with Schedule M requirements for pharmaceutical manufacturing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {scheduleM2023Clauses.map((clause) => (
                    <div key={clause.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{clause.title}</h3>
                          <Badge 
                            variant={clause.status === "Compliant" ? "default" : "secondary"}
                            className={clause.status === "Compliant" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {clause.completion >= 90 ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <AlertTriangle className="mr-1 h-3 w-3" />
                            )}
                            {clause.status}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{clause.completion}%</span>
                      </div>
                      <Progress value={clause.completion} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {clause.completion >= 90 
                          ? "All requirements met" 
                          : `${Math.ceil((100 - clause.completion) / 10)} items pending`
                        }
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Overall Compliance: 88%</p>
                        <p className="text-sm text-green-600">
                          Your facility meets most Schedule M 2023 requirements
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="h2-qr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  H2 QR Code Generator
                </CardTitle>
                <CardDescription>
                  Generate QR codes for pharmaceutical products as per H2 guidelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="product">Product</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.gtin}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="batch">Batch</Label>
                      <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches
                            .filter(batch => !selectedProduct || batch.productId === selectedProduct)
                            .map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.id} - {new Date(batch.mfgDate).toLocaleDateString()}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mrp">MRP (₹)</Label>
                      <Input
                        id="mrp"
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        placeholder="Enter MRP"
                      />
                    </div>

                    <div>
                      <Label htmlFor="license">License Number</Label>
                      <Input
                        id="license"
                        value={licenseNo}
                        onChange={(e) => setLicenseNo(e.target.value)}
                        placeholder="Manufacturing license number"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={generateH2QR} 
                        disabled={loading || user?.role === "Auditor"}
                        className="flex-1"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR Code
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={exportQRCodes}
                        disabled={!qrCodeUrl || user?.role === "Auditor"}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-4">
                    {qrCodeUrl ? (
                      <div className="text-center space-y-4">
                        <img src={qrCodeUrl} alt="Generated QR Code" className="mx-auto border rounded" />
                        <div className="text-sm text-muted-foreground">
                          <p>QR Code generated successfully</p>
                          <p>Ready for unit-level printing</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          QR code will appear here after generation
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gs1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  GS1 Serialization
                </CardTitle>
                <CardDescription>
                  Generate SSCC and SGTIN codes for product traceability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="serial-product">Product</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="serial-batch">Batch</Label>
                      <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches
                            .filter(batch => !selectedProduct || batch.productId === selectedProduct)
                            .map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.id}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        value={serialQuantity}
                        onChange={(e) => setSerialQuantity(e.target.value)}
                        placeholder="Number of units"
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={generateSerialization}
                      disabled={loading || user?.role === "Auditor"}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Generate Serialization
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={exportSerialization}
                      disabled={user?.role === "Auditor"}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">EPCIS Event Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Commission</p>
                            <p className="text-sm text-muted-foreground">SGTINs generated and assigned</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Pack</p>
                            <p className="text-sm text-muted-foreground">Units packed into shipping containers</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Ship</p>
                            <p className="text-sm text-muted-foreground">Products shipped to distribution</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}