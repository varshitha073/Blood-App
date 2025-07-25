"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock, Hospital, ArrowLeft, Building } from "lucide-react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

export default function HospitalLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if hospital profile exists
      const hospitalDoc = await getDoc(doc(db, "hospitaldetails", user.uid))

      if (hospitalDoc.exists()) {
        router.push("/hospital/dashboard")
      } else {
        router.push("/hospital/profile-setup")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    try {
      const hospitalName = formData.get("hospitalName") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create hospital auth record
      await setDoc(doc(db, "hospitals", user.uid), {
        hospitalName,
        email,
        createdAt: new Date().toISOString(),
        uid: user.uid,
      })

      router.push("/hospital/profile-setup")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Hospital className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">Hospital Portal</h1>
          </div>
          <p className="text-gray-600">Find donors for your patients</p>
        </div>

        <Card>
          <CardHeader>
            <div style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>Login</div>

            {/* <CardDescription>Login</CardDescription> */}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              {/* <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList> */}

              <TabsContent value="login">
                <form action={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              {/* <TabsContent value="signup">
                <form action={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-hospitalName">Hospital Name *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-hospitalName"
                        name="hospitalName"
                        type="text"
                        placeholder="Enter hospital name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent> */}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
