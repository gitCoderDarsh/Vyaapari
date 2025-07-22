"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import MobileHeader from "@/components/dashboard/MobileHeader"
import MobileMenu from "@/components/dashboard/MobileMenu"
import Sidebar from "@/components/dashboard/Sidebar"
import ProfileCard from "@/components/dashboard/ProfileCard"
import ConfirmationModal from "@/components/dashboard/ConfirmationModal"
import LogoutModal from "@/components/dashboard/LogoutModal"
import Toast from "@/components/ui/toast"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Profile")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })

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

  // Fetch fresh profile data from database
  const fetchProfileData = useCallback(async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        const freshData = {
          businessName: user.businessName || "Your Business",
          firstName: user.firstName || "First",
          lastName: user.lastName || "Last",
          email: user.email || "",
          phone: user.phone || "",
          logo: user.image || "/placeholder.svg?height=120&width=120&text=Logo",
        }
        
        setProfileData(freshData)
        setEditData(freshData)
        console.log('Fresh profile data loaded:', freshData)
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    }
  }, [])

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

  const handleModalConfirm = async () => {
    setIsUpdating(true)
    
    try {
      // Call API to update profile in database
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editData.firstName,
          lastName: editData.lastName,
          businessName: editData.businessName,
          phone: editData.phone,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update local state with the response data
        setProfileData(editData)
        setIsEditing(false)
        setShowModal(false)
        console.log("Profile updated successfully:", result.user)
        
        // Show success toast
        showToast("Profile updated successfully!")
      } else {
        console.error("Profile update failed:", result.error)
        showToast(`Failed to update profile: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      showToast("An error occurred while updating your profile. Please try again.", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleModalCancel = () => {
    setShowModal(false)
  }

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
  }

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" })
  }

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
        isLoading={isUpdating}
      />

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
