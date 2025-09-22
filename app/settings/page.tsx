"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Factory, Users, Zap, Save, Shield } from "lucide-react"
import AppShell from "@/components/layout/app-shell"
import { useAppStore, type UserRole } from "@/lib/store"
import { toast } from "sonner"

const mockUsers = [
  { id: "1", name: "Mahesh Kumar", email: "qa.mahesh@shuddhi.com", role: "QA" as UserRole, status: "Active" },
  { id: "2", name: "Ramesh Patel", email: "operator.ramesh@shuddhi.com", role: "Operator" as UserRole, status: "Active" },
  { id: "3", name: "Suresh Gupta", email: "qa.suresh@shuddhi.com", role: "QA" as UserRole, status: "Active" },
  { id: "4", name: "Priya Sharma", email: "operator.priya@shuddhi.com", role: "Operator" as UserRole, status: "Active" },
  { id: "5", name: "Raj Verma", email: "operator.raj@shuddhi.com", role: "Operator" as UserRole, status: "Active" },
]

const roleColors = {
  "Operator": "bg-blue-100 text-blue-800",
  "QA": "bg-green-100 text-green-800", 
  "Regulatory": "bg-purple-100 text-purple-800",
  "MD": "bg-red-100 text-red-800",
  "Auditor": "bg-gray-100 text-gray-800",
}

export default function SettingsPage() {
  const { user, plantInfo, updatePlantInfo } = useAppStore()
  
  // Plant settings
  const [plantName, setPlantName] = useState(plantInfo.name)
  const [plantLocation, setPlantLocation] = useState(plantInfo.location)
  const [licenseNo, setLicenseNo] = useState(plantInfo.licenseNo)
  
  // Feature toggles
  const [machineConnectors, setMachineConnectors] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [csvExports, setCsvExports] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [auditLogging, setAuditLogging] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)

  const handleSavePlantInfo = () => {
    updatePlantInfo({
      name: plantName,
      location: plantLocation,
      licenseNo: licenseNo,
    })
    toast.success("Plant information updated successfully")
  }

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    switch (feature) {
      case "machineConnectors":
        setMachineConnectors(enabled)
        toast.info(enabled 
          ? "Machine connectors enabled (demo only)" 
          : "Machine connectors disabled"
        )
        break
      case "darkMode":
        setDarkMode(enabled)
        toast.info(enabled ? "Dark mode enabled" : "Dark mode disabled")
        break
      case "csvExports":
        setCsvExports(enabled)
        toast.info(enabled ? "CSV exports enabled" : "CSV exports disabled")
        break
      case "emailNotifications":
        setEmailNotifications(enabled)
        toast.info(enabled ? "Email notifications enabled" : "Email notifications disabled")
        break
      case "auditLogging":
        setAuditLogging(enabled)
        toast.info(enabled ? "Audit logging enabled" : "Audit logging disabled")
        break
      case "autoBackup":
        setAutoBackup(enabled)
        toast.info(enabled ? "Auto backup enabled" : "Auto backup disabled")
        break
    }
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage plant configuration and system preferences</p>
        </div>

        <Tabs defaultValue="plant" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plant">Plant Profile</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="features">Feature Toggles</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="plant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Plant Information
                </CardTitle>
                <CardDescription>Basic information about your manufacturing facility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plantName">Plant Name</Label>
                    <Input
                      id="plantName"
                      value={plantName}
                      onChange={(e) => setPlantName(e.target.value)}
                      disabled={user?.role === "Auditor"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plantLocation">Location</Label>
                    <Input
                      id="plantLocation"
                      value={plantLocation}
                      onChange={(e) => setPlantLocation(e.target.value)}
                      disabled={user?.role === "Auditor"}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="licenseNo">Manufacturing License Number</Label>
                  <Input
                    id="licenseNo"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    disabled={user?.role === "Auditor"}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSavePlantInfo} disabled={user?.role === "Auditor"}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Regulatory Information
                </CardTitle>
                <CardDescription>Compliance and regulatory details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>WHO-GMP Certification</Label>
                    <div className="mt-1">
                      <Badge className="bg-green-100 text-green-800">Valid until Dec 2025</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Schedule M Compliance</Label>
                    <div className="mt-1">
                      <Badge className="bg-blue-100 text-blue-800">Schedule M 2023</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Drug License Number</Label>
                    <p className="text-sm text-muted-foreground mt-1">DL-25/001234-MFG</p>
                  </div>
                  <div>
                    <Label>GSTIN</Label>
                    <p className="text-sm text-muted-foreground mt-1">36ABCDE1234F1Z5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user accounts and role assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((mockUser) => (
                      <TableRow key={mockUser.id}>
                        <TableCell className="font-medium">{mockUser.name}</TableCell>
                        <TableCell>{mockUser.email}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[mockUser.role]}>
                            {mockUser.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={mockUser.status === "Active" ? "default" : "secondary"}>
                            {mockUser.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" disabled={user?.role === "Auditor"}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Role Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Overview of role-based access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">Operator</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Enter eBR data</li>
                      <li>• View batch information</li>
                      <li>• Cannot approve or sign</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">QA</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Review eBR by exception</li>
                      <li>• Raise deviations</li>
                      <li>• Sign and approve steps</li>
                      <li>• Generate reports</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">Regulatory</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Generate QR codes</li>
                      <li>• Manage serialization</li>
                      <li>• Handle compliance</li>
                      <li>• Manage licenses</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">MD</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Final batch approval</li>
                      <li>• Release packet generation</li>
                      <li>• All system access</li>
                      <li>• Strategic decisions</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">Auditor</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Read-only access</li>
                      <li>• Filter and search</li>
                      <li>• Download reports</li>
                      <li>• Cannot modify data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Feature Toggles
                </CardTitle>
                <CardDescription>Enable or disable system features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Machine Connectors</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable OPC-UA/Modbus connections (disabled in V0 prototype)
                    </p>
                  </div>
                  <Switch
                    checked={machineConnectors}
                    onCheckedChange={(checked) => handleFeatureToggle("machineConnectors", checked)}
                    disabled={true} // Always disabled in V0
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={(checked) => handleFeatureToggle("darkMode", checked)}
                    disabled={user?.role === "Auditor"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">CSV Exports</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow exporting data to CSV format
                    </p>
                  </div>
                  <Switch
                    checked={csvExports}
                    onCheckedChange={(checked) => handleFeatureToggle("csvExports", checked)}
                    disabled={user?.role === "Auditor"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send email alerts for critical events
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(checked) => handleFeatureToggle("emailNotifications", checked)}
                    disabled={user?.role === "Auditor"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive audit trail logging
                    </p>
                  </div>
                  <Switch
                    checked={auditLogging}
                    onCheckedChange={(checked) => handleFeatureToggle("auditLogging", checked)}
                    disabled={user?.role === "Auditor"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatic daily data backups
                    </p>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={(checked) => handleFeatureToggle("autoBackup", checked)}
                    disabled={user?.role === "Auditor"}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>System status and configuration details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Application Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span>v0.1.0 (Prototype)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Build:</span>
                        <span>2025.01.15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Environment:</span>
                        <Badge variant="outline">Demo</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database:</span>
                        <span>LocalStorage (Mock)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">System Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Backup:</span>
                        <span>2025-01-15 02:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage Used:</span>
                        <span>2.3 MB / 10 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Users:</span>
                        <span>5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo Notice */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Demo Environment</p>
                    <p className="text-sm text-blue-600">
                      This is a frontend-only prototype. All data is stored locally and will be reset on page refresh. 
                      No real backend connections or external APIs are used.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}