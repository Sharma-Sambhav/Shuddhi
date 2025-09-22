"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  timestamp: string
  read: boolean
}

export function NotificationCenter() {
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Batch B2024-001 Released",
      message: "Paracetamol 500mg tablets batch has been successfully released",
      type: "success",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      title: "Deviation DEV-2024-015 Requires Review",
      message: "Critical deviation in mixing process needs immediate attention",
      type: "error",
      timestamp: "4 hours ago",
      read: false,
    },
    {
      id: "3",
      title: "Stability Study Due",
      message: "6-month stability testing due for Product XYZ",
      type: "warning",
      timestamp: "1 day ago",
      read: true,
    },
  ])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Notifications
          <Badge variant="secondary">{notifications.filter((n) => !n.read).length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                  !notification.read ? "bg-muted/20" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <Badge className={getTypeColor(notification.type)} variant="secondary">
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                  {!notification.read && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
