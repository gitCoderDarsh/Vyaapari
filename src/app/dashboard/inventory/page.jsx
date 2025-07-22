"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import MobileHeader from "@/components/dashboard/MobileHeader"
import MobileMenu from "@/components/dashboard/MobileMenu"
import Sidebar from "@/components/dashboard/Sidebar"
import LogoutModal from "@/components/dashboard/LogoutModal"
import Toast from "@/components/ui/toast"
import { Package, Plus, Search, Filter } from "lucide-react"

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Inventory")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
  }

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" })
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  const navItems = [
    { name: "Inventory", icon: "Package", active: true },
    { name: "Profile", icon: "User", active: false },
  ]

  const handleNavClick = (itemName) => {
    if (itemName === "Logout") {
      setShowLogoutModal(true)
    } else if (itemName === "Inventory") {
      router.push("/dashboard/inventory")
    } else if (itemName === "Profile") {
      router.push("/dashboard/profile")
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(false)
    showToast("Logging out... See you soon!", "success")
    // Add a small delay to show the toast before redirecting
    setTimeout(() => {
      signOut({ callbackUrl: "/auth" })
    }, 1000)
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MobileHeader 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navItems={navItems}
        activeTab={activeTab}
        handleNavClick={handleNavClick}
        setShowLogoutModal={setShowLogoutModal}
      />

      <div className="flex">
        <Sidebar
          navItems={navItems}
          activeTab={activeTab}
          handleNavClick={handleNavClick}
          setShowLogoutModal={setShowLogoutModal}
        />

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Inventory Management</h1>
                <p className="text-gray-400 mt-2">Manage your business inventory and products</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus size={20} />
                Add Product
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors">
                  <Filter size={20} />
                  Filter
                </button>
              </div>
            </div>

            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Products</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Package className="text-blue-500" size={32} />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-500">0</p>
                  </div>
                  <Package className="text-yellow-500" size={32} />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-500">0</p>
                  </div>
                  <Package className="text-red-500" size={32} />
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold">Products</h2>
              </div>
              
              <div className="p-6">
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-600 mb-4" size={64} />
                  <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                  <p className="text-gray-400 mb-6">Start by adding your first product to the inventory</p>
                  <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors">
                    <Plus size={20} />
                    Add Your First Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LogoutModal
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        handleLogout={handleLogout}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  )
}
