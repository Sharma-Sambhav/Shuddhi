"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { User, AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { listTrainingRecords } from "@/lib/services"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { TrainingRecord } from "@/lib/seed"

const statusColors = {
  "Valid": "bg-green-100 text-green-800",
  "Expired": "bg-red-100 text-red-800",
  "Expiring Soon": "bg-yellow-100 text-yellow-800",
}

const statusIcons = {
  "Valid": CheckCircle,
  "Expired": AlertTriangle,
  "Expiring Soon": Clock,
}

export default function TrainingPage() {
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [blockExpiredActions, setBlockExpiredActions] = useState(true)
  
  const { user } = useAppStore()

  useEffect(() => {
    const loadTrainingRecords = async () => {
      try {
        const data = await listTrainingRecords()
        setTrainingRecords(data)
      } catch (error) {
        console.error("Failed to load training records:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTrainingRecords()
  }, [])

  const handleToggleBlocking = (enabled: boolean) => {
    setBlockExpiredActions(enabled)
    toast.success(enabled 
      ? "Expired training blocking enabled - users with expired training cannot sign eBR steps"
      : "Expired training blocking disabled"
    )
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

  // Group records by user
  const userTraining = trainingRecords.reduce((acc, record) => {
    if (!acc[record.user]) {
      acc[record.user] = []
    }
    acc[record.user].push(record)
    return acc
  }, {} as Record<string, TrainingRecord[]>)

  const skills = [...new Set(trainingRecords.map(r => r.skill))]
  const users = Object.keys(userTraining)

  const getOverallUserStatus = (userRecords: TrainingRecord[]) => {
    if (userRecords.some(r => r.status === "Expired")) return "Expired"
    if (userRecords.some(r => r.status === "Expiring Soon")) return "Expiring Soon"
    return "Valid"
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Training & Competency</h1>
            <p className="text-muted-foreground">Manage training records and competency matrix</p>
          </div>
          <Button disabled={user?.role === "Auditor"}>
            <User className="mr-2 h-4 w-4" />
            Add Training Record
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Valid Training</p>
                  <p className="text-2xl font-bold text-green-600">
                    {trainingRecords.filter(r => r.status === "Valid").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {trainingRecords.filter(r => r.status === "Expiring Soon").length}
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
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600">
                    {trainingRecords.filter(r => r.status === "Expired").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Training Enforcement
            </CardTitle>
            <CardDescription>
              Control how expired training affects system operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Block Actions When Training Expired</h4>
                <p className="text-sm text-muted-foreground">
                  Prevent users with expired training from signing eBR steps
                </p>
              </div>
              <Switch
                checked={blockExpiredActions}
                onCheckedChange={handleToggleBlocking}
                disabled={user?.role === "Auditor"}
              />
            </div>
            
            {blockExpiredActions && (
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Active:</strong> Users with expired training will see disabled sign buttons with tooltips explaining the restriction.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Training Competency Matrix</CardTitle>
            <CardDescription>Overview of training status across all users and skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">User</th>
                    <th className="text-left p-2 font-medium">Overall Status</th>
                    {skills.map(skill => (
                      <th key={skill} className="text-center p-2 font-medium min-w-32">
                        {skill}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const userRecords = userTraining[user]
                    const overallStatus = getOverallUserStatus(userRecords)
                    const StatusIcon = statusIcons[overallStatus]
                    
                    return (
                      <tr key={user} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{user}</td>
                        <td className="p-2">
                          <Badge className={statusColors[overallStatus]}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {overallStatus}
                          </Badge>
                        </td>
                        {skills.map(skill => {
                          const record = userRecords.find(r => r.skill === skill)
                          if (!record) {
                            return (
                              <td key={skill} className="p-2 text-center">
                                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                  Not Required
                                </Badge>
                              </td>
                            )
                          }
                          
                          const RecordStatusIcon = statusIcons[record.status]
                          return (
                            <td key={skill} className="p-2 text-center">
                              <div className="space-y-1">
                                <Badge className={statusColors[record.status]}>
                                  <RecordStatusIcon className="mr-1 h-3 w-3" />
                                  {record.status}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  Valid till: {new Date(record.validTill).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Records */}
        <Card>
          <CardHeader>
            <CardTitle>Training Records</CardTitle>
            <CardDescription>Detailed view of all training records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Valid Till</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingRecords.map((record, index) => {
                  const StatusIcon = statusIcons[record.status]
                  const validTillDate = new Date(record.validTill)
                  const today = new Date()
                  const daysRemaining = Math.ceil((validTillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <TableRow key={index} className={record.status === "Expired" ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{record.user}</TableCell>
                      <TableCell>{record.skill}</TableCell>
                      <TableCell>{validTillDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[record.status]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={daysRemaining < 0 ? "text-red-600 font-semibold" : daysRemaining < 30 ? "text-yellow-600 font-semibold" : ""}>
                          {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled={user?.role === "Auditor"}>
                          {record.status === "Expired" ? "Renew" : "Extend"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Demo Alert */}
        {blockExpiredActions && trainingRecords.some(r => r.status === "Expired") && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Training Enforcement Active</p>
                  <p className="text-sm text-yellow-700">
                    Users with expired training (like operator.ramesh) will see disabled signature buttons in eBR screens with explanatory tooltips.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}