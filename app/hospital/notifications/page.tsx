"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Phone, MapPin, Users, Droplets, Check } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

export default function HospitalNotifications() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Listen for notifications
        const notificationsQuery = query(collection(db, "notifications"), where("hospitalId", "==", currentUser.uid))

        const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
          const notificationsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Sort by newest first
          notificationsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setNotifications(notificationsData)
        })

        setLoading(false)

        return () => unsubscribeNotifications()
      } else {
        router.push("/hospital/auth")
      }
    })

    return () => unsubscribe()
  }, [router])

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleAcceptDonor = async (notification: any) => {
    if (!user) return

    setAcceptingRequest(notification.id)

    try {
      // Update the original request to accepted by hospital
      await updateDoc(doc(db, "requests", notification.requestId), {
        status: "accepted_by_hospital",
        acceptedByHospitalAt: new Date().toISOString(),
      })

      // Update notification to show hospital accepted
      await updateDoc(doc(db, "notifications", notification.id), {
        hospitalAccepted: true,
        hospitalAcceptedAt: new Date().toISOString(),
      })

      alert("Donor accepted successfully!")
    } catch (error) {
      console.error("Error accepting donor:", error)
      alert("Error accepting donor. Please try again.")
    } finally {
      setAcceptingRequest(null)
    }
  }

  const handleCallDonor = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, "_self")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/hospital/dashboard" className="text-blue-500 hover:text-blue-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You'll see notifications here when donors respond to your requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`${!notification.read ? "border-blue-200 bg-blue-50" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      {notification.type === "request_accepted" && (
                        <>
                          <Check className="h-5 w-5 mr-2 text-green-500" />
                          Request Accepted!
                        </>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {!notification.read && <Badge className="bg-blue-500 text-white">New</Badge>}
                      <span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <CardDescription>{notification.message}</CardDescription>
                </CardHeader>

                {notification.donorDetails && (
                  <CardContent>
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-semibold mb-3 text-green-700">Donor Contact Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">{notification.donorDetails.name}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Droplets className="h-4 w-4 mr-2 text-red-500" />
                          <Badge className="bg-red-100 text-red-800">{notification.donorDetails.bloodGroup}</Badge>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium text-green-700">{notification.donorDetails.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          Age: {notification.donorDetails.age}, Weight: {notification.donorDetails.weight}kg
                        </div>
                        <div className="flex items-center text-sm md:col-span-2">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {notification.donorDetails.city}, {notification.donorDetails.state}
                        </div>
                      </div>

                      {!notification.hospitalAccepted ? (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800 mb-3">
                            <strong>Action Required:</strong> Accept this donor to proceed with the donation.
                          </p>
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleAcceptDonor(notification)}
                              disabled={acceptingRequest === notification.id}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              {acceptingRequest === notification.id ? "Accepting..." : "Accept Donor"}
                            </Button>
                            <Button
                              onClick={() => handleCallDonor(notification.donorDetails.phone)}
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Call Donor
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800 mb-3">
                            <strong>✓ Donor Accepted:</strong> You have accepted this donor.
                          </p>
                          <Button
                            onClick={() => handleCallDonor(notification.donorDetails.phone)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Donor Now
                          </Button>
                        </div>
                      )}
                    </div>

                    {!notification.read && (
                      <div className="mt-4">
                        <Button onClick={() => markAsRead(notification.id)} variant="outline">
                          Mark as Read
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
