"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { motion } from "framer-motion"

interface Donation {
  id: string
  hospitalName: string
  donationDate: string
  hospitalDetails: string
}

const sampleDonations: Donation[] = [
  {
    id: "1",
    hospitalName: "CityCare Hospital",
    donationDate: "2025-07-15",
    hospitalDetails: "Address: Hyderabad, Phone: +91-9876543210",
  },
  {
    id: "2",
    hospitalName: "GreenLife Blood Bank",
    donationDate: "2025-06-28",
    hospitalDetails: "Address: Bangalore, Phone: +91-9845123456",
  },
  {
    id: "3",
    hospitalName: "Hope Medical Center",
    donationDate: "2025-06-10",
    hospitalDetails: "Address: Chennai, Phone: +91-9955443322",
  },
]

export default function DonationHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredDonations = sampleDonations.filter((donation) =>
    donation.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4ff] to-[#ffffff] px-4 py-10 md:px-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#333] drop-shadow-sm">
          🩸 Donation History
        </h1>
        <p className="text-gray-600 mt-2">Track your generous contributions with pride!</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <Input
          type="text"
          placeholder="🔍 Search by hospital name..."
          className="w-full md:w-1/2 px-4 py-3 text-base shadow-md rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select onValueChange={(value) => setFilter(value)} defaultValue="all">
          <SelectTrigger className="w-full md:w-60 px-4 py-3 text-base shadow-md rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="last6Months">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Donation Cards */}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredDonations.length > 0 ? (
          filteredDonations.map((donation, index) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-2xl shadow-lg transition-all hover:scale-[1.015] hover:shadow-2xl p-4">
                <CardHeader>
                  <CardTitle className="text-xl text-red-600 font-semibold">
                    {donation.hospitalName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700 text-[15px]">
                  <p>
                    <span className="font-medium text-gray-500">Donation Date:</span>{" "}
                    {donation.donationDate}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Details:</span>{" "}
                    {donation.hospitalDetails}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-16 text-lg">
            No donation history found.
          </p>
        )}
      </div>
    </div>
  )
}
