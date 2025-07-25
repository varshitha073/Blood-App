"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Hospital, ArrowLeft, Users, Droplets, Heart, Plus } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

const bloodGroups = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]

export default function FindDonors() {
  const [user, setUser] = useState<any>(null)
  const [hospitalDetails, setHospitalDetails] = useState<any>(null)
  const [donors, setDonors] = useState<any[]>([])
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("")
  const [loading, setLoading] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [requestingBlood, setRequestingBlood] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Fetch hospital details
        const hospitalDoc = await getDoc(doc(db, "hospitaldetails", currentUser.uid))
        if (hospitalDoc.exists()) {
          setHospitalDetails(hospitalDoc.data())
        } else {
          router.push("/hospital/profile-setup")
          return
        }

        setLoading(false)
      } else {
        router.push("/hospital/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleBloodGroupFilter = async (bloodGroup: string) => {
    setSelectedBloodGroup(bloodGroup)

    if (bloodGroup) {
      try {
        const donorsQuery = query(
          collection(db, "donordetails"),
          where("isEligible", "==", true),
          where("bloodGroup", "==", bloodGroup),
          where("isAvailable", "==", true),
        )
        const donorsSnapshot = await getDocs(donorsQuery)
        const donorsData = donorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setDonors(donorsData)
      } catch (error) {
        console.error("Error fetching donors:", error)
      }
    } else {
      setDonors([])
    }
  }

  const handleRequestBlood = async (formData: FormData) => {
    if (!user || !hospitalDetails || !selectedBloodGroup) return

    setRequestingBlood(true)

    try {
      const unitsRequired = Number.parseInt(formData.get("unitsRequired") as string)

      const requestData = {
        hospitalId: user.uid,
        hospitalName: hospitalDetails.hospitalName,
        address: hospitalDetails.address,
        phone: hospitalDetails.phone,
        city: hospitalDetails.city,
        state: hospitalDetails.state,
        country: hospitalDetails.country,
        pincode: hospitalDetails.pincode,
        bloodGroup: selectedBloodGroup,
        unitsRequired: unitsRequired,
        createdAt: new Date().toISOString(),
        status: "pending",
      }

      // Send request to all eligible donors of the required blood group
      for (const donor of donors) {
        await addDoc(collection(db, "bloodrequests"), {
          ...requestData,
          donorId: donor.uid,
          donorName: donor.name,
        })
      }

      setIsRequestDialogOpen(false)
      alert(`Request sent to ${donors.length} eligible donors!`)
    } catch (error) {
      console.error("Error sending request:", error)
    } finally {
      setRequestingBlood(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <Link
            href="/hospital/dashboard"
            className="flex items-center space-x-2 mb-8 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2 mb-8">
            <Hospital className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">Find Donors</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Find Donors</h2>
            <Button
              onClick={() => setIsRequestDialogOpen(true)}
              disabled={!selectedBloodGroup || donors.length === 0}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Blood
            </Button>
          </div>

          {/* Filter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filter by Blood Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-xs">
                  <Select value={selectedBloodGroup} onValueChange={handleBloodGroupFilter}>
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
                {selectedBloodGroup && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{donors.length} donors found</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donors List */}
          {selectedBloodGroup ? (
            donors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map((donor) => (
                  <Card key={donor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-red-100 text-red-800">{donor.bloodGroup}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Age: {donor.age} years
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Droplets className="h-4 w-4 mr-2" />
                        Weight: {donor.weight} kg
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Heart className="h-4 w-4 mr-2" />
                        Health: {donor.healthCondition?.replace("_", " ") || "Healthy"}
                      </div>
                      <div className="text-xs text-green-600">✓ Available for donation</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No donors found</h3>
                <p className="text-gray-600">No available donors found for blood group {selectedBloodGroup}</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a blood group</h3>
              <p className="text-gray-600">Choose a blood group from the filter above to see available donors</p>
            </div>
          )}

          {/* Request Dialog */}
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Blood</DialogTitle>
                <DialogDescription>
                  Send request to {donors.length} donors for {selectedBloodGroup} blood
                </DialogDescription>
              </DialogHeader>
              <form action={handleRequestBlood} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unitsRequired">Units Required *</Label>
                  <Input
                    id="unitsRequired"
                    name="unitsRequired"
                    type="number"
                    placeholder="Number of units"
                    min="1"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={requestingBlood}>
                  {requestingBlood ? "Sending Request..." : "Send Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
