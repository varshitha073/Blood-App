import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Hospital, Users, Droplets } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">BloodConnect</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 hover:text-red-500 transition-colors">
                About
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-red-500 transition-colors">
                How It Works
              </a>
              <a href="#contact" className="text-gray-600 hover:text-red-500 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Save Lives Through
            <span className="text-red-500"> Blood Donation</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect donors with hospitals seamlessly. Join our community of life-savers and help those in need find the
            blood they require.
          </p>

          {/* Registration Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Donor Registration */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-red-200">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Donor</CardTitle>
                <CardDescription className="text-gray-600">
                  Join our community of heroes and help save lives by donating blood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Create your donor profile</li>
                  <li>• Get matched with nearby hospitals</li>
                  <li>• Receive donation requests</li>
                  <li>• Track your donation history</li>
                </ul>
                <Link href="/donor/auth">
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">Donor</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Hospital Registration */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Hospital className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Hospital</CardTitle>
                <CardDescription className="text-gray-600">
                  Find qualified donors quickly and efficiently for your patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Search for eligible donors</li>
                  <li>• Send donation requests</li>
                  <li>• Filter by blood group & location</li>
                  <li>• Manage blood inventory</li>
                </ul>
                <Link href="/hospital/login">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Hospital</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-xl text-gray-600">Simple steps to save lives</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-red-500" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Register</h4>
              <p className="text-gray-600">Sign up as a donor or hospital with your details</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Droplets className="h-8 w-8 text-yellow-500" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Match</h4>
              <p className="text-gray-600">Get matched based on blood type, location, and eligibility</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-green-500" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Donate</h4>
              <p className="text-gray-600">Connect and coordinate the life-saving donation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
       <section id="contact" className="py-20 bg-white">
 <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">BloodConnect</h1>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-4">Connecting donors with hospitals to save lives</p>
            <p className="text-sm text-gray-500">© 2024 BloodConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
       </section>
     
    </div>
  )
}
