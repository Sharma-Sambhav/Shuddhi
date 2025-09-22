"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const releaseTimeData = [
  { month: "Jan", traditional: 21, shuddhi: 3 },
  { month: "Feb", traditional: 22, shuddhi: 2.8 },
  { month: "Mar", traditional: 20, shuddhi: 3.2 },
  { month: "Apr", traditional: 23, shuddhi: 2.9 },
  { month: "May", traditional: 21, shuddhi: 3.1 },
  { month: "Jun", traditional: 24, shuddhi: 2.7 },
]

const complianceData = [
  { area: "Schedule M", score: 98 },
  { area: "GMP", score: 96 },
  { area: "Serialization", score: 99 },
  { area: "Documentation", score: 97 },
  { area: "Training", score: 95 },
]

const deviationTypes = [
  { name: "Process", value: 35, color: "#6366f1" },
  { name: "Equipment", value: 25, color: "#dc2626" },
  { name: "Material", value: 20, color: "#059669" },
  { name: "Documentation", value: 15, color: "#d97706" },
  { name: "Other", value: 5, color: "#6b7280" },
]

export function AdvancedCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Release Time Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Release Time Improvement</CardTitle>
          <CardDescription>Traditional vs Shuddhi Release Cloud™</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={releaseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="traditional" stroke="#dc2626" strokeWidth={2} name="Traditional Process" />
              <Line type="monotone" dataKey="shuddhi" stroke="#6366f1" strokeWidth={2} name="Shuddhi Release Cloud™" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Compliance Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Scores</CardTitle>
          <CardDescription>Current regulatory compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis domain={[90, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deviation Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Deviation Distribution</CardTitle>
          <CardDescription>Types of deviations by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviationTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviationTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Impact Calculator</CardTitle>
          <CardDescription>Financial benefits of Shuddhi Release Cloud™</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹2.4Cr</div>
              <div className="text-sm text-green-700">Annual Savings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-blue-700">Time Reduction</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Reduced Review Time:</span>
              <span className="font-medium">₹1.2Cr/year</span>
            </div>
            <div className="flex justify-between">
              <span>Faster Market Release:</span>
              <span className="font-medium">₹0.8Cr/year</span>
            </div>
            <div className="flex justify-between">
              <span>Compliance Efficiency:</span>
              <span className="font-medium">₹0.4Cr/year</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
