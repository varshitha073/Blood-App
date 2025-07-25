"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Hospital, LogOut, Home, Users, Search, CheckCircle } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import Link from "next/link"

export default function HospitalDashboard() {
  const [user, setUser] = useState<any>(null)
  const [hospitalDetails, setHospitalDetails] = useState<any>(null)
  const [stats, setStats] = useState({
    totalRequests: 0,
    acceptedRequests: 0,
    pendingRequests: 0,
    declinedRequests: 0,
  })
  const [loading, setLoading] = useState(true)
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

        // Fetch statistics
        await fetchStats(currentUser.uid)
        setLoading(false)
      } else {
        router.push("/hospital/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchStats = async (hospitalId: string) => {
    try {
      const requestsQuery = query(collection(db, "bloodrequests"), where("hospitalId", "==", hospitalId))
      const requestsSnapshot = await getDocs(requestsQuery)

      const totalRequests = requestsSnapshot.size
      const acceptedRequests = requestsSnapshot.docs.filter((doc) => doc.data().status === "accepted").length
      const pendingRequests = requestsSnapshot.docs.filter((doc) => doc.data().status === "pending").length
      const declinedRequests = requestsSnapshot.docs.filter((doc) => doc.data().status === "declined").length

      setStats({
        totalRequests,
        acceptedRequests,
        pendingRequests,
        declinedRequests,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Hospital className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">Hospital Portal</h1>
          </div>

          <nav className="space-y-2">
            <Link href="/hospital/find-donors">
              <Button variant="ghost" className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Find Donors
              </Button>
            </Link>
            <Link href="/hospital/requested-donors">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Requested Donors
              </Button>
            </Link>
            <Link href="/hospital/accepted-donors">
              <Button variant="ghost" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepted Donors
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
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hospital Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Hospital Profile</CardTitle>
                <CardDescription>Your hospital information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospitalDetails ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hospital Name</label>
                      <p className="text-lg font-semibold">{hospitalDetails.hospitalName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-sm text-gray-700">{hospitalDetails.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact</label>
                      <p className="text-sm text-gray-700">{hospitalDetails.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-sm text-gray-700">
                        {hospitalDetails.city}, {hospitalDetails.state}, {hospitalDetails.country}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No profile information available</p>
                )}
              </CardContent>
            </Card>

            {/* Hospital History/Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>Your blood request statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
                    <div className="text-sm text-gray-500">Total Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.acceptedRequests}</div>
                    <div className="text-sm text-gray-500">Accepted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.declinedRequests}</div>
                    <div className="text-sm text-gray-500">Declined</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span>
                      {stats.totalRequests > 0 ? Math.round((stats.acceptedRequests / stats.totalRequests) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalRequests > 0 ? (stats.acceptedRequests / stats.totalRequests) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/hospital/find-donors">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Find Donors</h4>
                    <p className="text-sm text-gray-600">Search for eligible blood donors</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/hospital/requested-donors">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Requested Donors</h4>
                    <p className="text-sm text-gray-600">View pending requests</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/hospital/accepted-donors">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Accepted Donors</h4>
                    <p className="text-sm text-gray-600">View confirmed donations</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
