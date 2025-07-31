"use client"

import React, { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import MobileHeader from "@/components/dashboard/MobileHeader"
import MobileMenu from "@/components/dashboard/MobileMenu"
import Sidebar from "@/components/dashboard/Sidebar"
import LogoutModal from "@/components/dashboard/LogoutModal"
import AddItemModal from "@/components/inventory/AddItemModal"
import EditItemModal from "@/components/inventory/EditItemModal"
import DeleteItemModal from "@/components/inventory/DeleteItemModal"
import Toast from "@/components/ui/toast"
import { Package, Plus, Search, Filter, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Inventory")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [selectedItemName, setSelectedItemName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [inventoryData, setInventoryData] = useState({
    items: [],
    totalItems: 0,
    totalValue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const [expandedRows, setExpandedRows] = useState(new Set())

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
  }

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" })
  }

  // Toggle row expansion
  const toggleRowExpansion = (itemId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setInventoryData(data)
      } else {
        showToast('Failed to fetch inventory', 'error')
      }
    } catch (error) {
      console.error('Fetch inventory error:', error)
      showToast('Error loading inventory', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Load inventory on component mount
  useEffect(() => {
    if (session?.user) {
      fetchInventory()
    }
  }, [session])

  // Handle successful item addition
  const handleAddSuccess = () => {
    fetchInventory() // Refresh inventory data
  }

  // Handle edit item
  const handleEditItem = (itemId) => {
    setSelectedItemId(itemId)
    setShowEditModal(true)
  }

  // Handle successful item edit
  const handleEditSuccess = () => {
    fetchInventory() // Refresh inventory data
    setSelectedItemId(null)
  }

  // Handle delete item
  const handleDeleteItem = (itemId, itemName) => {
    setSelectedItemId(itemId)
    setSelectedItemName(itemName)
    setShowDeleteModal(true)
  }

  // Confirm delete item
  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/inventory/${selectedItemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast('Item deleted successfully!', 'success')
        fetchInventory() // Refresh inventory data
        setShowDeleteModal(false)
        setSelectedItemId(null)
        setSelectedItemName('')
      } else {
        const result = await response.json()
        showToast(`Failed to delete item: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Delete item error:', error)
      showToast('An error occurred while deleting the item', 'error')
    } finally {
      setIsDeleting(false)
    }
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
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
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
                    <p className="text-2xl font-bold">{inventoryData.totalItems}</p>
                  </div>
                  <Package className="text-blue-500" size={32} />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Value</p>
                    <p className="text-2xl font-bold">₹{inventoryData.totalValue.toLocaleString()}</p>
                  </div>
                  <Package className="text-green-500" size={32} />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {inventoryData.items.filter(item => item.stockQuantity < 10).length}
                    </p>
                  </div>
                  <Package className="text-yellow-500" size={32} />
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold">Products</h2>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400">Loading inventory...</div>
                  </div>
                ) : inventoryData.items.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto text-gray-600 mb-4" size={64} />
                    <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                    <p className="text-gray-400 mb-6">Start by adding your first product to the inventory</p>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus size={20} />
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 font-medium text-gray-300">Item Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">Price</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">Value</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.items.map((item) => {
                          const isExpanded = expandedRows.has(item.id)
                          const hasCustomFields = item.customFields && Object.keys(item.customFields).length > 0
                          
                          return (
                            <React.Fragment key={item.id}>
                              <tr className={`hover:bg-gray-800 ${!isExpanded ? 'border-b border-gray-800' : ''}`}>
                                <td className="py-3 px-4">{item.itemName}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded text-sm ${
                                    item.stockQuantity === 0 
                                      ? 'bg-red-900 text-red-200' 
                                      : item.stockQuantity < 10 
                                      ? 'bg-yellow-900 text-yellow-200' 
                                      : 'bg-green-900 text-green-200'
                                  }`}>
                                    {item.stockQuantity}
                                  </span>
                                </td>
                                <td className="py-3 px-4">₹{Number(item.itemPrice).toLocaleString()}</td>
                                <td className="py-3 px-4">₹{(item.stockQuantity * Number(item.itemPrice)).toLocaleString()}</td>
                                <td className="py-3 px-4">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleEditItem(item.id)}
                                      className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-700 transition-colors"
                                      title="Edit item"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteItem(item.id, item.itemName)}
                                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-700 transition-colors"
                                      title="Delete item"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {hasCustomFields && (
                                    <button
                                      onClick={() => toggleRowExpansion(item.id)}
                                      className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                                      title={isExpanded ? "Hide custom fields" : "Show custom fields"}
                                    >
                                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {isExpanded && hasCustomFields && (
                                <tr className="border-b border-gray-800">
                                  <td colSpan="6" className="py-3 px-4">
                                    <div className="ml-4">
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(item.customFields).map(([key, value]) => (
                                          <span
                                            key={key}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-700 text-gray-300"
                                          >
                                            <span className="font-medium">{key}:</span>
                                            <span className="ml-1">{value}</span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        showToast={showToast}
      />

      <EditItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedItemId(null)
        }}
        onSuccess={handleEditSuccess}
        showToast={showToast}
        itemId={selectedItemId}
      />

      <DeleteItemModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedItemId(null)
          setSelectedItemName('')
        }}
        onConfirm={handleConfirmDelete}
        itemName={selectedItemName}
        isLoading={isDeleting}
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
