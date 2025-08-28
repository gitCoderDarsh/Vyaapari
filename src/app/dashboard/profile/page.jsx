"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

  // Profile data state - Initialize empty, will be populated from session/API
  const [profileData, setProfileData] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    logo: "/placeholder.svg?height=120&width=120&text=Logo",
  })

  const [editData, setEditData] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    logo: "/placeholder.svg?height=120&width=120&text=Logo",
  })

  // Fetch fresh profile data from database
  const fetchProfileData = useCallback(async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        const freshData = {
          businessName: user.businessName || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
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
    console.log("Session useEffect triggered:", session?.user)
    if (session?.user) {
      // Always update from session - this ensures tab navigation works correctly
      const sessionData = {
        businessName: session.user.businessName || "",
        firstName: session.user.firstName || session.user.name?.split(' ')[0] || "",
        lastName: session.user.lastName || session.user.name?.split(' ')[1] || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        logo: session.user.image || "/placeholder.svg?height=120&width=120&text=Logo",
      }
      console.log("Setting profile data from session:", sessionData)
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
    { name: "Assistant", icon: "Bot", active: false },
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

  // Add validation to ensure required fields are filled before updating
  const isFormValid = () => {
    if (!editData.firstName.trim() || !editData.lastName.trim() || !editData.businessName.trim()) {
      showToast("First name, last name, and business name are required.", "error");
      return false;
    }
    return true;
  };

  const handleModalConfirm = async () => {
    if (!isFormValid()) {
      return; // Prevent API call if form is invalid
    }

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
          email: editData.email,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update local state with the response data from API response
        const updatedData = {
          businessName: result.user.businessName || "",
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          email: result.user.email || "",
          phone: result.user.phone || "",
          logo: result.user.image || "/placeholder.svg?height=120&width=120&text=Logo",
        }
        
        setProfileData(updatedData)
        setEditData(updatedData)
        setIsEditing(false)
        setShowModal(false)
        console.log("Profile updated successfully:", result.user)
        
        // Force session refresh with new data so tab navigation works correctly
        await update({
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          businessName: result.user.businessName,
          phone: result.user.phone,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`.trim()
        })
        console.log("Session updated with fresh profile data:", {
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          businessName: result.user.businessName,
          phone: result.user.phone,
          email: result.user.email
        })
        
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
    } else if (itemName === "Assistant") {
      router.push("/dashboard/assistant")
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
          isCollapsed={false}
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
