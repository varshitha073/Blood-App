"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Droplets, MapPin, Phone, Calendar, CheckCircle } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

export default function ConfirmedRequests() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [confirmedRequests, setConfirmedRequests] = useState<any[]>([])
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

        // Listen for accepted requests
        const requestsQuery = query(
          collection(db, "bloodrequests"),
          where("donorId", "==", currentUser.uid),
          where("status", "==", "accepted"),
        )

        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
          const requestsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Sort by acceptance date
          requestsData.sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime())
          setConfirmedRequests(requestsData)
        })

        setLoading(false)

        return () => unsubscribeRequests()
      } else {
        router.push("/donor/auth")
      }
    })

    return () => unsubscribe()
  }, [router])

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
            <h1 className="text-xl font-bold text-gray-900">Confirmed Requests</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Confirmed Requests</h2>
            <div className="text-lg font-semibold text-green-600">Confirmed: {confirmedRequests.length}</div>
          </div>

          {confirmedRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No confirmed requests</h3>
              <p className="text-gray-600">You haven't accepted any donation requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.hospitalName}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
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
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmed: {new Date(request.acceptedAt).toLocaleDateString()}
                    </div>

                    <div className="pt-3 border-t bg-green-50 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ You have confirmed this donation request. The hospital will contact you soon.
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
