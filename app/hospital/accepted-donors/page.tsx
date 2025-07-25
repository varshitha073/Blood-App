"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hospital, ArrowLeft, Users, Droplets, Phone, MapPin, Calendar } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

export default function AcceptedDonors() {
  const [user, setUser] = useState<any>(null)
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Listen for accepted requests
        const requestsQuery = query(
          collection(db, "bloodrequests"),
          where("hospitalId", "==", currentUser.uid),
          where("status", "==", "accepted"),
        )

        const unsubscribeRequests = onSnapshot(requestsQuery, async (snapshot) => {
          const requestsData = []

          for (const docSnapshot of snapshot.docs) {
            const requestData = { id: docSnapshot.id, ...docSnapshot.data() }

            // Fetch donor details
            try {
              const donorDoc = await getDoc(doc(db, "donordetails", requestData.donorId))
              if (donorDoc.exists()) {
                requestData.donorDetails = donorDoc.data()
              }
            } catch (error) {
              console.error("Error fetching donor details:", error)
            }

            requestsData.push(requestData)
          }

          // Sort by acceptance date
          requestsData.sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime())
          setAcceptedRequests(requestsData)
        })

        setLoading(false)

        return () => unsubscribeRequests()
      } else {
        router.push("/hospital/login")
      }
    })

    return () => unsubscribe()
  }, [router])

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
            <h1 className="text-xl font-bold text-gray-900">Accepted Donors</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Accepted Donors</h2>
            <div className="text-lg font-semibold text-green-600">Accepted Requests: {acceptedRequests.length}</div>
          </div>

          {acceptedRequests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No accepted requests</h3>
              <p className="text-gray-600">No donors have accepted your requests yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {acceptedRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.donorDetails?.name || request.donorName}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Droplets className="h-4 w-4 mr-2 text-red-500" />
                      <Badge className="bg-red-100 text-red-800">{request.bloodGroup}</Badge>
                      <span className="ml-2">({request.unitsRequired} units)</span>
                    </div>

                    {request.donorDetails && (
                      <>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium text-green-700">{request.donorDetails.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {request.donorDetails.city}, {request.donorDetails.state}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          Age: {request.donorDetails.age}, Weight: {request.donorDetails.weight}kg
                        </div>
                      </>
                    )}

                    <div className="flex items-center text-sm text-green-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Confirmed: {new Date(request.acceptedAt).toLocaleDateString()}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Request sent: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
