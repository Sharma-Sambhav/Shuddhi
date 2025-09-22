"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp, Download, BarChart3 } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listProducts, listBatches } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { Product, Batch } from "@/lib/seed"

// Mock CPV data
const cpvData = {
  "P-IBU-400": {
    "Granulation Temp": [
      { batch: "IBU-001", value: 52.3, date: "2025-08-01" },
      { batch: "IBU-002", value: 51.8, date: "2025-08-15" },
      { batch: "IBU-003", value: 52.1, date: "2025-09-01" },
      { batch: "IBU-004", value: 53.2, date: "2025-09-15" },
      { batch: "IBU-005", value: 52.0, date: "2025-10-01" },
    ],
    "Tablet Hardness": [
      { batch: "IBU-001", value: 7.2, date: "2025-08-01" },
      { batch: "IBU-002", value: 6.8, date: "2025-08-15" },
      { batch: "IBU-003", value: 5.4, date: "2025-09-01" },
      { batch: "IBU-004", value: 7.1, date: "2025-09-15" },
      { batch: "IBU-005", value: 6.9, date: "2025-10-01" },
    ],
    "Moisture Content": [
      { batch: "IBU-001", value: 1.2, date: "2025-08-01" },
      { batch: "IBU-002", value: 1.5, date: "2025-08-15" },
      { batch: "IBU-003", value: 3.2, date: "2025-09-01" },
      { batch: "IBU-004", value: 1.1, date: "2025-09-15" },
      { batch: "IBU-005", value: 1.3, date: "2025-10-01" },
    ]
  },
  "P-PARA-650": {
    "Dissolution Rate": [
      { batch: "PARA-001", value: 98.5, date: "2025-08-01" },
      { batch: "PARA-002", value: 97.2, date: "2025-08-15" },
      { batch: "PARA-003", value: 76.5, date: "2025-09-01" },
      { batch: "PARA-004", value: 98.1, date: "2025-09-15" },
      { batch: "PARA-005", value: 97.8, date: "2025-10-01" },
    ]
  }
}

const parameterSpecs = {
  "Granulation Temp": { min: 50, max: 55, unit: "°C" },
  "Tablet Hardness": { min: 6, max: 9, unit: "kp" },
  "Moisture Content": { min: 0.5, max: 2.0, unit: "%" },
  "Dissolution Rate": { min: 80, max: 100, unit: "%" },
}

export default function CPVPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedParameter, setSelectedParameter] = useState("")
  const [loading, setLoading] = useState(true)
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const productData = await listProducts()
        setProducts(productData)
        if (productData.length > 0) {
          setSelectedProduct(productData[0].id)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (selectedProduct && cpvData[selectedProduct as keyof typeof cpvData]) {
      const parameters = Object.keys(cpvData[selectedProduct as keyof typeof cpvData])
      if (parameters.length > 0) {
        setSelectedParameter(parameters[0])
      }
    }
  }, [selectedProduct])

  const exportChart = () => {
    toast.success("Chart exported as PNG")
    // Mock export functionality
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

  const currentData = selectedProduct && selectedParameter && cpvData[selectedProduct as keyof typeof cpvData] 
    ? cpvData[selectedProduct as keyof typeof cpvData][selectedParameter as keyof typeof cpvData[keyof typeof cpvData]]
    : []

  const specs = selectedParameter ? parameterSpecs[selectedParameter as keyof typeof parameterSpecs] : null

  const availableParameters = selectedProduct && cpvData[selectedProduct as keyof typeof cpvData] 
    ? Object.keys(cpvData[selectedProduct as keyof typeof cpvData])
    : []

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Continued Process Verification</h1>
            <p className="text-muted-foreground">Monitor critical process parameters and trends</p>
          </div>
          <Button onClick={exportChart} disabled={!currentData.length}>
            <Download className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Parameter Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product</label>
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
                <label className="text-sm font-medium mb-2 block">Parameter</label>
                <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parameter" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParameters.map((param) => (
                      <SelectItem key={param} value={param}>
                        {param}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        {currentData.length > 0 && specs ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {selectedParameter} Trend
              </CardTitle>
              <CardDescription>
                Specification: {specs.min} - {specs.max} {specs.unit}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="batch" />
                  <YAxis domain={[specs.min * 0.8, specs.max * 1.2]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value} ${specs.unit}`, "Actual Value"]}
                    labelFormatter={(label) => `Batch: ${label}`}
                  />
                  
                  {/* Specification bands */}
                  <ReferenceLine 
                    y={specs.min} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5" 
                    label={{ value: `Min: ${specs.min}`, position: "left" }}
                  />
                  <ReferenceLine 
                    y={specs.max} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5" 
                    label={{ value: `Max: ${specs.max}`, position: "left" }}
                  />
                  
                  {/* Trend line */}
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Analysis */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium text-blue-800">Current Value</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentData[currentData.length - 1]?.value} {specs.unit}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-medium text-green-800">Within Spec</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {currentData.filter(d => d.value >= specs.min && d.value <= specs.max).length}/{currentData.length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-medium text-yellow-800">Trend</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {currentData.length >= 2 && currentData[currentData.length - 1].value > currentData[currentData.length - 2].value 
                      ? "↗ Increasing" 
                      : currentData.length >= 2 && currentData[currentData.length - 1].value < currentData[currentData.length - 2].value
                      ? "↘ Decreasing"
                      : "→ Stable"
                    }
                  </p>
                </div>
              </div>

              {/* Out of spec alerts */}
              {currentData.some(d => d.value < specs.min || d.value > specs.max) && (
                <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">Out of Specification Batches</h4>
                  <div className="space-y-1">
                    {currentData
                      .filter(d => d.value < specs.min || d.value > specs.max)
                      .map(d => (
                        <p key={d.batch} className="text-sm text-red-700">
                          {d.batch}: {d.value} {specs.unit} 
                          {d.value < specs.min ? " (Below minimum)" : " (Above maximum)"}
                        </p>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                {!selectedProduct 
                  ? "Please select a product to view CPV trends"
                  : !selectedParameter
                  ? "Please select a parameter to view trends"
                  : "No trend data available for the selected parameter"
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Process Capability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Cpk: 1.33</div>
              <p className="text-sm text-muted-foreground">Process is capable</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Control Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">In Control</div>
              <p className="text-sm text-muted-foreground">No special causes detected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">15%</div>
              <p className="text-sm text-muted-foreground">Variability reduction</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}