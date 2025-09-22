"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Factory, Thermometer, AlertTriangle, CheckCircle, Calendar, TrendingDown } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listStabilityStudies, listProducts } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import type { StabilityStudy, Product } from "@/lib/seed"

// Mock environmental monitoring data
const environmentalData = [
  {
    chamber: "Stability Chamber 1",
    location: "QC Lab - Room 101",
    conditions: "25°C ± 2°C, 60% ± 5% RH",
    lastCalibration: "2024-12-15",
    nextCalibration: "2025-06-15",
    status: "Valid",
    currentTemp: 24.8,
    currentRH: 61.2
  },
  {
    chamber: "Stability Chamber 2", 
    location: "QC Lab - Room 102",
    conditions: "40°C ± 2°C, 75% ± 5% RH",
    lastCalibration: "2024-11-20",
    nextCalibration: "2025-05-20",
    status: "Valid",
    currentTemp: 39.9,
    currentRH: 74.8
  },
  {
    chamber: "Photostability Chamber",
    location: "QC Lab - Room 103", 
    conditions: "25°C ± 2°C, ICH Option 2",
    lastCalibration: "2023-08-10",
    nextCalibration: "2024-08-10",
    status: "Overdue",
    currentTemp: 25.1,
    currentRH: 45.2
  }
]

export default function StabilityPage() {
  const [stabilityStudies, setStabilityStudies] = useState<StabilityStudy[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studyData, productData] = await Promise.all([
          listStabilityStudies(),
          listProducts()
        ])
        setStabilityStudies(studyData)
        setProducts(productData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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

  const overdueCalibrations = environmentalData.filter(chamber => chamber.status === "Overdue")

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stability & Environmental Monitoring</h1>
            <p className="text-muted-foreground">Manage stability studies and environmental monitoring</p>
          </div>
          <Button disabled={user?.role === "Auditor"}>
            <Factory className="mr-2 h-4 w-4" />
            New Study
          </Button>
        </div>

        {/* Alert for overdue calibrations */}
        {overdueCalibrations.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">
                    {overdueCalibrations.length} Chamber{overdueCalibrations.length > 1 ? 's' : ''} Overdue for Calibration
                  </p>
                  <p className="text-sm text-red-600">
                    {overdueCalibrations.map(c => c.chamber).join(", ")} require immediate calibration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="studies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="studies">Stability Studies</TabsTrigger>
            <TabsTrigger value="environmental">Environmental Monitoring</TabsTrigger>
            <TabsTrigger value="calibration">Calibration Management</TabsTrigger>
          </TabsList>

          <TabsContent value="studies" className="space-y-4">
            {/* Study Planner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Study Planner
                </CardTitle>
                <CardDescription>Overview of ongoing stability studies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {stabilityStudies.map((study) => {
                    const product = products.find(p => p.id === study.productId)
                    const latestPoint = study.points[study.points.length - 1]
                    const nextPull = study.points.length < 5 ? `${study.points.length * 3 + 3} months` : "Complete"
                    
                    return (
                      <Card key={study.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{product?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Study: {study.id} • Conditions: {study.conditions}
                              </p>
                            </div>
                            <Badge variant={nextPull === "Complete" ? "default" : "secondary"}>
                              {nextPull === "Complete" ? "Complete" : `Next: ${nextPull}`}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-blue-600 font-medium">Current Assay</p>
                              <p className="text-lg font-bold text-blue-800">{latestPoint.assay}%</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                              <p className="text-sm text-green-600 font-medium">Dissolution</p>
                              <p className="text-lg font-bold text-green-800">{latestPoint.dissolution}%</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded">
                              <p className="text-sm text-purple-600 font-medium">Time Points</p>
                              <p className="text-lg font-bold text-purple-800">{study.points.length}/5</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-600 font-medium">Status</p>
                              <p className="text-lg font-bold text-gray-800">
                                {nextPull === "Complete" ? "Complete" : "Ongoing"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stabilityStudies.map((study) => {
                const product = products.find(p => p.id === study.productId)
                
                return (
                  <Card key={study.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{product?.name} - {study.conditions}</CardTitle>
                      <CardDescription>Stability trend over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={study.points}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                          <YAxis domain={[90, 105]} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="assay" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Assay (%)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="dissolution" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="Dissolution (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      
                      <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>Assay</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Dissolution</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="environmental" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Environmental Monitoring
                </CardTitle>
                <CardDescription>Real-time monitoring of stability chambers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {environmentalData.map((chamber, index) => (
                    <Card key={index} className={chamber.status === "Overdue" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{chamber.chamber}</h4>
                            <p className="text-sm text-muted-foreground">{chamber.location}</p>
                            <p className="text-sm text-muted-foreground">{chamber.conditions}</p>
                          </div>
                          <Badge className={chamber.status === "Valid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {chamber.status === "Valid" ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Valid
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Overdue
                              </>
                            )}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm text-muted-foreground">Current Temp</p>
                            <p className="text-lg font-bold">{chamber.currentTemp}°C</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm text-muted-foreground">Current RH</p>
                            <p className="text-lg font-bold">{chamber.currentRH}%</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm text-muted-foreground">Last Calibration</p>
                            <p className="text-sm font-medium">{new Date(chamber.lastCalibration).toLocaleDateString()}</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm text-muted-foreground">Next Calibration</p>
                            <p className={`text-sm font-medium ${chamber.status === "Overdue" ? "text-red-600" : ""}`}>
                              {new Date(chamber.nextCalibration).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calibration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calibration Management</CardTitle>
                <CardDescription>Track calibration schedules and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last Calibration</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {environmentalData.map((chamber, index) => {
                      const nextDue = new Date(chamber.nextCalibration)
                      const today = new Date()
                      const daysUntilDue = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <TableRow key={index} className={chamber.status === "Overdue" ? "bg-red-50" : ""}>
                          <TableCell className="font-medium">{chamber.chamber}</TableCell>
                          <TableCell>{chamber.location}</TableCell>
                          <TableCell>{new Date(chamber.lastCalibration).toLocaleDateString()}</TableCell>
                          <TableCell>{nextDue.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={chamber.status === "Valid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {chamber.status === "Valid" ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  {daysUntilDue > 0 ? `${daysUntilDue} days` : "Due today"}
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  {Math.abs(daysUntilDue)} days overdue
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant={chamber.status === "Overdue" ? "destructive" : "outline"} 
                              size="sm"
                              disabled={user?.role === "Auditor"}
                            >
                              {chamber.status === "Overdue" ? "Calibrate Now" : "Schedule"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Calibrations</p>
                      <p className="text-2xl font-bold text-green-600">
                        {environmentalData.filter(c => c.status === "Valid").length}
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
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">
                        {environmentalData.filter(c => c.status === "Overdue").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Compliance Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round((environmentalData.filter(c => c.status === "Valid").length / environmentalData.length) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}