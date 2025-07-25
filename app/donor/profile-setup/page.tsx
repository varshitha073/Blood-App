"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, User, Phone, MapPin, Calendar, Droplets } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function ProfileSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push("/donor/auth")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (formData: FormData) => {
    if (!user) return

    setIsLoading(true)

    try {
      const age = Number.parseInt(formData.get("age") as string)
      const weight = Number.parseInt(formData.get("weight") as string)
      const lastDonationDate = formData.get("lastDonationDate") as string
      const healthCondition = formData.get("healthCondition") as string
      const hemoglobin = formData.get("hemoglobin") as string

      // Calculate eligibility
      let isEligible = true
      const eligibilityReasons: string[] = []

      // Age check (18-65)
      if (age < 18 || age > 65) {
        isEligible = false
        eligibilityReasons.push("Age must be between 18-65 years")
      }

      // Weight check (minimum 50kg)
      if (weight < 50) {
        isEligible = false
        eligibilityReasons.push("Weight must be at least 50kg")
      }

      // Last donation date check (90 days gap)
      if (lastDonationDate) {
        const lastDonation = new Date(lastDonationDate)
        const daysSinceLastDonation = Math.floor((Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceLastDonation < 90) {
          isEligible = false
          eligibilityReasons.push("Must wait at least 90 days since last donation")
        }
      }

      // Health condition check
      if (healthCondition !== "healthy") {
        isEligible = false
        eligibilityReasons.push("Must be in good health condition")
      }

      // Hemoglobin check (optional but if provided, must be >= 12.5)
      if (hemoglobin && Number.parseFloat(hemoglobin) < 12.5) {
        isEligible = false
        eligibilityReasons.push("Hemoglobin level must be at least 12.5 g/dL")
      }

      const profileData = {
        uid: user.uid,
        name: formData.get("name") as string,
        age: age,
        weight: weight,
        phone: formData.get("phone") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
        pincode: formData.get("pincode") as string,
        lastDonationDate: lastDonationDate || null,
        bloodGroup: formData.get("bloodGroup") as string,
        healthCondition: healthCondition,
        hemoglobin: hemoglobin ? Number.parseFloat(hemoglobin) : null,
        email: user.email,
        createdAt: new Date().toISOString(),
        isEligible: isEligible,
        isAvailable: true, // Default to available
        eligibilityReasons: eligibilityReasons,
        eligibilityCheckedAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "donordetails", user.uid), profileData)

      if (!isEligible) {
        alert(`Profile created but you are currently not eligible for donation:\n${eligibilityReasons.join("\n")}`)
      }

      router.push("/donor/dashboard")
    } catch (error) {
      console.error("Error creating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
          </div>
          <p className="text-gray-600">Help us match you with hospitals in need</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Donor Information</CardTitle>
            <CardDescription>Please fill in your details to complete your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="h-5 w-5 mr-2 text-red-500" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" placeholder="Enter your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input id="age" name="age" type="number" placeholder="Enter your age" min="18" max="65" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input id="weight" name="weight" type="number" placeholder="Enter your weight" min="50" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter phone number"
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
                  <MapPin className="h-5 w-5 mr-2 text-red-500" />
                  Location Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" placeholder="Enter your city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" placeholder="Enter your state" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" name="country" placeholder="Enter your country" required />
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

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-red-500" />
                  Medical Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group *</Label>
                    <Select name="bloodGroup" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastDonationDate">Last Donation Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="lastDonationDate" name="lastDonationDate" type="date" className="pl-10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthCondition">Health Condition *</Label>
                <Select name="healthCondition" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select health condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Generally Healthy</SelectItem>
                    <SelectItem value="minor_illness">Minor Illness (Cold/Fever)</SelectItem>
                    <SelectItem value="chronic_condition">Chronic Condition</SelectItem>
                    <SelectItem value="on_medication">On Medication</SelectItem>
                    <SelectItem value="recent_surgery">Recent Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hemoglobin">Hemoglobin Level (g/dL) - Optional</Label>
                <Input
                  id="hemoglobin"
                  name="hemoglobin"
                  type="number"
                  step="0.1"
                  min="8"
                  max="20"
                  placeholder="Enter hemoglobin level (optional)"
                />
                <p className="text-xs text-gray-500">Minimum 12.5 g/dL required for eligibility</p>
              </div>

              <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" disabled={isLoading}>
                {isLoading ? "Creating Profile..." : "Create Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
