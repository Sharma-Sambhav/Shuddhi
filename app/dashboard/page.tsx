"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Package, CheckCircle, AlertTriangle, Clock, Shield, TrendingDown, TrendingUp, Activity } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { getDashboardStats, getAuditLog } from "@/lib/services"
import { useAppStore } from "@/lib/store"



interface DashboardStats {
  batchesInQA: number
  readyToRelease: number
  openDeviations: number
  trainingExpiring: number
  complianceAlerts: number
  releaseLeadTime: { batch: string; days: number }[]
  yieldData: { batch: string; expected: number; actual: number }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppStore()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardData, auditData] = await Promise.all([getDashboardStats(), getAuditLog()])
        setStats(dashboardData)
        setRecentActivity(auditData.slice(0, 5))
      } catch (error) {
        console.error("Failed to load dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  if (!stats) return null

  const kpiCards = [
    {
      title: "Batches in QA",
      value: stats.batchesInQA,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ready to Release",
      value: stats.readyToRelease,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Open Deviations",
      value: stats.openDeviations,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Training Expiring",
      value: stats.trainingExpiring,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Compliance Alerts",
      value: stats.complianceAlerts,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's what's happening at your plant today.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Release Lead Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                Release Lead Time Improvement
              </CardTitle>
              <CardDescription>Days from manufacturing to release (last 6 batches)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.releaseLeadTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="batch" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="days" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>85% improvement:</strong> From 21 days to 3 days average release time
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Yield & Loss Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Yield vs Expected
              </CardTitle>
              <CardDescription>Actual vs expected yield (last 5 batches)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.yieldData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="batch" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    name="Expected"
                  />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.entity}</p>
                    {activity.details && <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {activity.user}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
