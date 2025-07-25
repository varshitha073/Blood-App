"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hospital, Building, Phone, MapPin } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function HospitalProfileSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hospitalData, setHospitalData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Get hospital basic data
        const hospitalDoc = await getDoc(doc(db, "hospitals", currentUser.uid))
        if (hospitalDoc.exists()) {
          setHospitalData(hospitalDoc.data())
        }

        // Check if hospital details already exist
        const hospitalDetailsDoc = await getDoc(doc(db, "hospitaldetails", currentUser.uid))
        if (hospitalDetailsDoc.exists()) {
          router.push("/hospital/dashboard")
        }
      } else {
        router.push("/hospital/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (formData: FormData) => {
    if (!user || !hospitalData) return

    setIsLoading(true)

    try {
      const hospitalDetailsData = {
        uid: user.uid,
        hospitalName: hospitalData.hospitalName,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
        pincode: formData.get("pincode") as string,
        email: user.email,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "hospitaldetails", user.uid), hospitalDetailsData)
      router.push("/hospital/dashboard")
    } catch (error) {
      console.error("Error creating hospital profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !hospitalData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Hospital className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">Complete Hospital Profile</h1>
          </div>
          <p className="text-gray-600">Add your hospital details to start requesting donors</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Information</CardTitle>
            <CardDescription>Please fill in your hospital details</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {/* Hospital Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  Hospital Details
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input id="hospitalName" value={hospitalData.hospitalName} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address *</Label>
                    <Input id="address" name="address" placeholder="Enter complete hospital address" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter contact number"
                        className="pl-10"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  Location Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" placeholder="Enter city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" placeholder="Enter state" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" name="country" placeholder="Enter country" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="text"
                      placeholder="Enter pincode"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
                {isLoading ? "Setting up profile..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
