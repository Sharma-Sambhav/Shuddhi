"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Bell,
  ChevronUp,
  Factory,
  FileText,
  Home,
  Package,
  Settings,
  Shield,
  TrendingUp,
  Users,
  AlertTriangle,
  User,
  ScanLine,
  ShieldCheck,
  FileSignature,
  LogOut,
} from "lucide-react"
import { useAppStore, type UserRole } from "@/lib/store"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Batches",
    url: "/batches",
    icon: Package,
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: Shield,
  },
  {
    title: "Deviations",
    url: "/deviations",
    icon: AlertTriangle,
  },
  {
    title: "CPV",
    url: "/cpv",
    icon: TrendingUp,
  },
  {
    title: "Vendors",
    url: "/vendors",
    icon: Users,
  },
  {
    title: "Stability",
    url: "/stability",
    icon: Factory,
  },
  {
    title: "Training",
    url: "/training",
    icon: User,
  },
  {
    title: "Audit",
    url: "/audit",
    icon: FileSignature,
  },
  {
    title: "Recall",
    url: "/recall",
    icon: ScanLine,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

const roleColors: Record<UserRole, string> = {
  Operator: "bg-blue-100 text-blue-800",
  QA: "bg-green-100 text-green-800",
  Regulatory: "bg-purple-100 text-purple-800",
  MD: "bg-red-100 text-red-800",
  Auditor: "bg-gray-100 text-gray-800",
}

export default function AdminAppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, switchRole, plantInfo } = useAppStore()
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const handleNavigation = (url: string) => {
    router.push(url)
  }

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role)
    setRoleMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar variant="inset">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-red-500">Shuddhi Release Cloud™</span>
                <span className="text-xs text-muted-foreground">{plantInfo.name}</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <button className="w-full">
                          <item.icon />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                        <AvatarFallback className="rounded-lg">
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                      <ChevronUp className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                          <AvatarFallback className="rounded-lg">
                            {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{user.name}</span>
                          <span className="truncate text-xs">{user.email}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
                    {(Object.keys(roleColors) as UserRole[]).map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={cn(
                          "flex items-center justify-between",
                          user.role === role && "bg-accent"
                        )}
                      >
                        <span>{role}</span>
                        {user.role === role && <Badge variant="secondary" className="text-xs">Current</Badge>}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1 flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold">
                  {navItems.find(item => item.url === pathname)?.title || "Shuddhi Release Cloud"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", roleColors[user.role])}>
                Admin
              </Badge>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          <footer className="border-t px-4 py-2 bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{plantInfo.location} • License: {plantInfo.licenseNo}</span>
              <span>Last sync: {new Date(plantInfo.lastSync).toLocaleTimeString()}</span>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  )
}