"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import MobileHeader from "@/components/dashboard/MobileHeader"
import MobileMenu from "@/components/dashboard/MobileMenu"
import Sidebar from "@/components/dashboard/Sidebar"
import ProfileCard from "@/components/dashboard/ProfileCard"
import ConfirmationModal from "@/components/dashboard/ConfirmationModal"
import LogoutModal from "@/components/dashboard/LogoutModal"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Profile")
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Profile data state - Initialize with session data if available
  const [profileData, setProfileData] = useState({
    businessName: "TechCorp Solutions",
    firstName: "John",
    lastName: "Smith",
    email: "contact@techcorp.com",
    phone: "+1 (555) 123-4567",
    logo: "/placeholder.svg?height=120&width=120&text=Logo",
  })

  const [editData, setEditData] = useState(profileData)

  // Update profile data when session loads
  useEffect(() => {
    if (session?.user) {
      const sessionData = {
        businessName: session.user.businessName || "Your Business",
        firstName: session.user.firstName || session.user.name?.split(' ')[0] || "First",
        lastName: session.user.lastName || session.user.name?.split(' ')[1] || "Last",
        email: session.user.email || "",
        phone: session.user.phone || "",
        logo: session.user.image || "/placeholder.svg?height=120&width=120&text=Logo",
      }
      setProfileData(sessionData)
      setEditData(sessionData)
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  const navItems = [
    { name: "Inventory", icon: "Package", active: false },
    { name: "Profile", icon: "User", active: true },
  ]

  const handleEdit = () => {
    setEditData(profileData)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  const handleConfirm = () => {
    setShowModal(true)
  }

  const handleModalConfirm = () => {
    setProfileData(editData)
    setIsEditing(false)
    setShowModal(false)
    // Here you can add API call to save profile data
    console.log("Profile updated:", editData)
  }

  const handleModalCancel = () => {
    setShowModal(false)
  }

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNavClick = (itemName) => {
    if (itemName === "Logout") {
      setShowLogoutModal(true)
    } else {
      setActiveTab(itemName)
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(false)
    signOut({ callbackUrl: "/auth" })
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
          <div className="max-w-2xl mx-auto">
            <ProfileCard
              profileData={profileData}
              editData={editData}
              isEditing={isEditing}
              handleEdit={handleEdit}
              handleCancel={handleCancel}
              handleConfirm={handleConfirm}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        showModal={showModal}
        handleModalConfirm={handleModalConfirm}
        handleModalCancel={handleModalCancel}
      />

      <LogoutModal
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        handleLogout={handleLogout}
      />
    </div>
  )
}
