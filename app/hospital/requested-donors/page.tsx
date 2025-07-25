"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Hospital, ArrowLeft, Users, Droplets, Heart, Clock, Filter } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

export default function RequestedDonors() {
  const [user, setUser] = useState<any>(null)
  const [allRequests, setAllRequests] = useState<any[]>([])
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Listen for requests
        const requestsQuery = query(collection(db, "bloodrequests"), where("hospitalId", "==", currentUser.uid))

        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
          const requestsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Sort by newest first
          requestsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setAllRequests(requestsData)
          setFilteredRequests(requestsData)
        })

        setLoading(false)

        return () => unsubscribeRequests()
      } else {
        router.push("/hospital/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    if (status === "all") {
      setFilteredRequests(allRequests)
    } else {
      const filtered = allRequests.filter((request) => request.status === status)
      setFilteredRequests(filtered)
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
            <h1 className="text-xl font-bold text-gray-900">Requested Donors</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Requested Donors</h2>
            <div className="text-lg font-semibold text-blue-600">Requested Donors: {filteredRequests.length}</div>
          </div>

          {/* Filter */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Filter by Status</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Total: {allRequests.length}</span>
                  <span>Pending: {allRequests.filter((r) => r.status === "pending").length}</span>
                  <span>Accepted: {allRequests.filter((r) => r.status === "accepted").length}</span>
                  <span>Declined: {allRequests.filter((r) => r.status === "declined").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter === "all" ? "No requests sent" : `No ${statusFilter} requests`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === "all"
                  ? "You haven't sent any blood requests yet"
                  : `No requests with ${statusFilter} status found`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-red-100 text-red-800">{request.bloodGroup}</Badge>
                      <Badge
                        className={`${
                          request.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : request.status === "declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status === "accepted"
                          ? "Accepted"
                          : request.status === "declined"
                            ? "Declined"
                            : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Donor: {request.donorName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Droplets className="h-4 w-4 mr-2" />
                      Units: {request.unitsRequired}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    {request.acceptedAt && (
                      <div className="flex items-center text-sm text-green-600">
                        <Heart className="h-4 w-4 mr-2" />
                        Accepted: {new Date(request.acceptedAt).toLocaleDateString()}
                      </div>
                    )}
                    {request.declinedAt && (
                      <div className="flex items-center text-sm text-red-600">
                        <Heart className="h-4 w-4 mr-2" />
                        Declined: {new Date(request.declinedAt).toLocaleDateString()}
                      </div>
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
