"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("qa.mahesh@shuddhi.com")
  const [password, setPassword] = useState("demo123")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAppStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success("Login successful! Welcome to Shuddhi Release Cloud™")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Shuddhi Release Cloud™</CardTitle>
          <CardDescription>Pharmaceutical Batch Release Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1">
              <div>
                <strong>Email:</strong> qa.mahesh@shuddhi.com
              </div>
              <div>
                <strong>Password:</strong> demo123
              </div>
              <div className="text-blue-600 mt-2">Use role switcher after login to demo different permissions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
