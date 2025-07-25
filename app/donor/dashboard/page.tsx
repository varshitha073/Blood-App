"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  Heart,
  User,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Inbox,
  Check,
  Home,
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import Link from "next/link"

export default function DonorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Get donor profile
        const profileDoc = await getDoc(doc(db, "donordetails", currentUser.uid))
        if (profileDoc.exists()) {
          setProfile(profileDoc.data())
        } else {
          router.push("/donor/profile-setup")
          return
        }

        setLoading(false)
      } else {
        router.push("/donor/auth")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleAvailabilityToggle = async (isAvailable: boolean) => {
    if (!user) return

    try {
      await updateDoc(doc(db, "donordetails", user.uid), {
        isAvailable: isAvailable,
      })
      setProfile({ ...profile, isAvailable })
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900">Donor Portal</h1>
          </div>

          <nav className="space-y-2">
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Link href="/donor/requests-received">
              <Button variant="ghost" className="w-full justify-start">
                <Inbox className="h-4 w-4 mr-2" />
                Requests Received
              </Button>
            </Link>
            <Link href="/donor/confirmed-requests">
              <Button variant="ghost" className="w-full justify-start">
                <Check className="h-4 w-4 mr-2" />
                Confirmed Requests
              </Button>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex space-x-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Donor Dashboard</h2>

          {/* Eligibility Status Alert */}
          {profile && (
            <div className="mb-6">
              {profile.isEligible ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>✓ You are eligible for blood donation!</strong> You can accept donation requests from
                    hospitals.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>⚠ You are currently not eligible for donation.</strong>
                    <br />
                    Reasons: {profile.eligibilityReasons?.join(", ")}
                    <br />
                    <span className="text-sm">Please update your profile when conditions change.</span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Availability Toggle */}
          {profile && profile.isEligible && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Availability Status</h3>
                    <p className="text-sm text-gray-600">Toggle your availability to receive donation requests</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${profile.isAvailable ? "text-green-600" : "text-red-600"}`}>
                      {profile.isAvailable ? "Available" : "Not Available"}
                    </span>
                    <Switch checked={profile.isAvailable || false} onCheckedChange={handleAvailabilityToggle} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-red-500" />
                Your Profile
              </CardTitle>
              <CardDescription>Your donor information and eligibility status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Name</Label>
                      <p className="text-lg font-semibold">{profile.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Blood Group</Label>
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-2 text-red-500" />
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {profile.bloodGroup}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Age</Label>
                      <p className="text-lg">
                        {profile.age} years
                        {(profile.age < 18 || profile.age > 65) && (
                          <span className="text-red-500 text-sm ml-2">⚠ Not eligible age</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Weight</Label>
                      <p className="text-lg">
                        {profile.weight} kg
                        {profile.weight < 50 && <span className="text-red-500 text-sm ml-2">⚠ Below minimum</span>}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <p>{profile.phone}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <p>
                          {profile.city}, {profile.state}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Health Condition</Label>
                      <p className="text-lg capitalize">
                        {profile.healthCondition?.replace("_", " ")}
                        {profile.healthCondition !== "healthy" && (
                          <span className="text-red-500 text-sm ml-2">⚠ Not eligible</span>
                        )}
                      </p>
                    </div>
                    {profile.hemoglobin && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Hemoglobin</Label>
                        <p className="text-lg">
                          {profile.hemoglobin} g/dL
                          {profile.hemoglobin < 12.5 && (
                            <span className="text-red-500 text-sm ml-2">⚠ Below minimum</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {profile.lastDonationDate && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Donation</Label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <p>{new Date(profile.lastDonationDate).toLocaleDateString()}</p>
                        {(() => {
                          const daysSince = Math.floor(
                            (Date.now() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24),
                          )
                          return daysSince < 90 ? (
                            <span className="text-red-500 text-sm ml-2">⚠ Wait {90 - daysSince} more days</span>
                          ) : (
                            <span className="text-green-500 text-sm ml-2">✓ Eligible ({daysSince} days ago)</span>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
