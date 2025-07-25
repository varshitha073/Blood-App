"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Droplets, MapPin, Phone, Calendar, AlertTriangle } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, addDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

export default function RequestsReceived() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

        // Listen for donation requests
        const requestsQuery = query(collection(db, "bloodrequests"), where("donorId", "==", currentUser.uid))

        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
          const requestsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Sort by newest first
          requestsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setRequests(requestsData)
        })

        setLoading(false)

        return () => unsubscribeRequests()
      } else {
        router.push("/donor/auth")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "bloodrequests", requestId), {
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      })

      // Create notification for hospital
      const request = requests.find((r) => r.id === requestId)
      if (request && profile) {
        await addDoc(collection(db, "notifications"), {
          type: "request_accepted",
          hospitalId: request.hospitalId,
          donorId: user.uid,
          requestId: requestId,
          message: `${profile.name} has accepted your blood donation request`,
          donorDetails: {
            name: profile.name,
            phone: profile.phone,
            bloodGroup: profile.bloodGroup,
            age: profile.age,
            weight: profile.weight,
            city: profile.city,
            state: profile.state,
          },
          createdAt: new Date().toISOString(),
          read: false,
        })
      }

      alert("Request accepted successfully! Hospital has been notified.")
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "bloodrequests", requestId), {
        status: "declined",
        declinedAt: new Date().toISOString(),
      })
      alert("Request declined.")
    } catch (error) {
      console.error("Error declining request:", error)
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
          <Link href="/donor/dashboard" className="flex items-center space-x-2 mb-8 text-red-500 hover:text-red-600">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2 mb-8">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900">Requests Received</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Requests Received</h2>
            <div className="text-lg font-semibold text-red-600">Total Requests: {requests.length}</div>
          </div>

          {!profile?.isEligible ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Eligible</h3>
              <p className="text-red-600 text-sm">
                Complete your eligibility requirements to receive donation requests
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests received</h3>
              <p className="text-gray-600">You haven't received any donation requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.hospitalName}</CardTitle>
                      <Badge
                        className={`${
                          request.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : request.status === "declined"
                              ? "bg-red-100 text-red-800"
                              : request.status === "cancelled"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status === "accepted"
                          ? "Accepted"
                          : request.status === "declined"
                            ? "Declined"
                            : request.status === "cancelled"
                              ? "Cancelled"
                              : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm font-medium text-red-600">
                      <Droplets className="h-4 w-4 mr-2" />
                      Blood Type: {request.bloodGroup}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {request.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {request.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Droplets className="h-4 w-4 mr-2" />
                      Units needed: {request.unitsRequired}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Requested: {new Date(request.createdAt).toLocaleString()}
                    </div>

                    {request.status === "pending" && profile?.isEligible && (
                      <div className="flex space-x-2 pt-3">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(request.id)}>
                          Decline
                        </Button>
                      </div>
                    )}
                    {request.status === "accepted" && (
                      <div className="text-sm text-green-600 font-medium pt-3">
                        ✓ Request accepted - Hospital has been notified
                      </div>
                    )}
                    {request.status === "declined" && (
                      <div className="text-sm text-red-600 font-medium pt-3">✗ Request declined</div>
                    )}
                    {request.status === "cancelled" && (
                      <div className="text-sm text-gray-600 font-medium pt-3">⊘ Request cancelled by hospital</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
