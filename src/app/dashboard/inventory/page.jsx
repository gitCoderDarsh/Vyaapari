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
import AIBusinessChatbot from "@/components/dashboard/AIBusinessChatbot"
import { Package, Plus, Search, Filter, Edit, Trash2, ChevronDown, ChevronRight, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({
    stockStatus: [], // ["inStock", "outOfStock", "lowStock"]
    priceRange: []   // ["0to50", "51to100", "101to500", "501to1000", "above1000"]
  })
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc' // 'asc' or 'desc'
  })

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

  // Handle row click for expansion
  const handleRowClick = (e, item) => {
    // Don't expand if clicking on action buttons
    if (e.target.closest('button')) {
      return
    }
    
    const hasCustomFields = item.customFields && Object.keys(item.customFields).length > 0
    if (hasCustomFields) {
      toggleRowExpansion(item.id)
    }
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
    { name: "Sales", icon: "Receipt", active: false },
    { name: "Assistant", icon: "Bot", active: false },
    { name: "Profile", icon: "User", active: false },
  ]

  const handleNavClick = (itemName) => {
    if (itemName === "Logout") {
      setShowLogoutModal(true)
    } else if (itemName === "Inventory") {
      router.push("/dashboard/inventory")
    } else if (itemName === "Sales") {
      router.push("/dashboard/sales")
    } else if (itemName === "Assistant") {
      // Set a flag so Assistant page knows to start with transition
      sessionStorage.setItem('navigatingToAssistant', 'true')
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

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Apply stock status filters
  const applyStockFilters = (items) => {
    if (filters.stockStatus.length === 0) return items
    
    return items.filter(item => {
      const quantity = item.stockQuantity
      
      if (filters.stockStatus.includes("outOfStock") && quantity === 0) return true
      if (filters.stockStatus.includes("lowStock") && quantity > 0 && quantity < 10) return true
      if (filters.stockStatus.includes("inStock") && quantity >= 10) return true
      
      return false
    })
  }

  // Apply price range filters
  const applyPriceFilters = (items) => {
    if (filters.priceRange.length === 0) return items
    
    return items.filter(item => {
      const price = Number(item.itemPrice)
      
      if (filters.priceRange.includes("0to50") && price >= 0 && price <= 50) return true
      if (filters.priceRange.includes("51to100") && price >= 51 && price <= 100) return true
      if (filters.priceRange.includes("101to500") && price >= 101 && price <= 500) return true
      if (filters.priceRange.includes("501to1000") && price >= 501 && price <= 1000) return true
      if (filters.priceRange.includes("above1000") && price > 1000) return true
      
      return false
    })
  }

  // Sort items based on sort configuration
  const applySorting = (items) => {
    if (!sortConfig.key) return items
    
    return [...items].sort((a, b) => {
      let aValue, bValue
      
      switch (sortConfig.key) {
        case 'name':
          aValue = a.itemName.toLowerCase()
          bValue = b.itemName.toLowerCase()
          break
        case 'stock':
          aValue = Number(a.stockQuantity)
          bValue = Number(b.stockQuantity)
          break
        case 'price':
          aValue = Number(a.itemPrice)
          bValue = Number(b.itemPrice)
          break
        case 'value':
          aValue = Number(a.stockQuantity) * Number(a.itemPrice)
          bValue = Number(b.stockQuantity) * Number(b.itemPrice)
          break
        default:
          return 0
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  // Filter items based on search query and filters
  const filteredItems = (() => {
    let items = inventoryData.items
    
    // Apply search filter
    if (searchQuery) {
      items = items.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply stock status filters
    items = applyStockFilters(items)
    
    // Apply price range filters
    items = applyPriceFilters(items)
    
    // Apply sorting
    items = applySorting(items)
    
    return items
  })()

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      stockStatus: [],
      priceRange: []
    })
    setShowFilterModal(false)
  }

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Get sort icon for column headers
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} className="text-gray-500" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-blue-400" />
      : <ArrowDown size={14} className="text-blue-400" />
  }

  // Handle natural language search from AI chatbot
  const handleNaturalSearch = (searchTerms) => {
    if (searchTerms) {
      // Handle different types of natural search
      if (searchTerms.includes('price:under:')) {
        const price = searchTerms.split(':')[2]
        // Set price filter for items under specified price
        setFilters(prev => ({
          ...prev,
          priceRange: price <= 50 ? ['0to50'] : 
                     price <= 100 ? ['0to50', '51to100'] :
                     price <= 500 ? ['0to50', '51to100', '101to500'] :
                     ['0to50', '51to100', '101to500', '501to1000']
        }))
        showToast(`Filtered products under ₹${price}`, 'success')
      } else if (searchTerms.includes('price:above:')) {
        const price = searchTerms.split(':')[2]
        // Set price filter for items above specified price
        setFilters(prev => ({
          ...prev,
          priceRange: price >= 1000 ? ['above1000'] :
                     price >= 500 ? ['501to1000', 'above1000'] :
                     price >= 100 ? ['101to500', '501to1000', 'above1000'] :
                     ['51to100', '101to500', '501to1000', 'above1000']
        }))
        showToast(`Filtered products above ₹${price}`, 'success')
      } else {
        // Regular search terms
        setSearchQuery(searchTerms)
        showToast(`Searching for: ${searchTerms}`, 'success')
      }
    }
  }

  // Check if any filters are active
  const hasActiveFilters = filters.stockStatus.length > 0 || filters.priceRange.length > 0

  // Update inventory stats based on filtered items
  const filteredStats = {
    totalItems: filteredItems.length,
    totalValue: filteredItems.reduce((sum, item) => 
      sum + (Number(item.stockQuantity) * Number(item.itemPrice)), 0
    ),
    lowStockItems: filteredItems.filter(item => item.stockQuantity < 10).length
  }

  // Get display text for stats
  const getStatsLabel = (baseLabel) => {
    if (searchQuery && hasActiveFilters) return `Filtered ${baseLabel}`
    if (searchQuery) return `Search ${baseLabel}`
    if (hasActiveFilters) return `Filtered ${baseLabel}`
    return `Total ${baseLabel}`
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
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setShowFilterModal(true)}
                  className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                    hasActiveFilters 
                      ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <Filter size={20} />
                  Filter
                  {hasActiveFilters && (
                    <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {filters.stockStatus.length + filters.priceRange.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {getStatsLabel("Products")}
                    </p>
                    <p className="text-2xl font-bold">{filteredStats.totalItems}</p>
                  </div>
                  <Package className="text-blue-500" size={32} />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {getStatsLabel("Value")}
                    </p>
                    <p className="text-2xl font-bold">₹{filteredStats.totalValue.toLocaleString()}</p>
                  </div>
                  <Package className="text-green-500" size={32} />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {filteredStats.lowStockItems}
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
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto text-gray-600 mb-4" size={64} />
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-gray-400 mb-6">
                      {searchQuery && hasActiveFilters 
                        ? `No products match your search "${searchQuery}" and current filters`
                        : searchQuery 
                        ? `No products match your search "${searchQuery}"`
                        : "No products match the current filters"
                      }
                    </p>
                    <div className="flex gap-3 justify-center">
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          Clear Search
                        </button>
                      )}
                      {hasActiveFilters && (
                        <button 
                          onClick={clearAllFilters}
                          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 font-medium text-gray-300">
                            <button
                              onClick={() => handleSort('name')}
                              className="flex items-center gap-2 hover:text-white transition-colors"
                            >
                              Item Name
                              {getSortIcon('name')}
                            </button>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">
                            <button
                              onClick={() => handleSort('stock')}
                              className="flex items-center gap-2 hover:text-white transition-colors"
                            >
                              Stock
                              {getSortIcon('stock')}
                            </button>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">
                            <button
                              onClick={() => handleSort('price')}
                              className="flex items-center gap-2 hover:text-white transition-colors"
                            >
                              Price
                              {getSortIcon('price')}
                            </button>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">
                            <button
                              onClick={() => handleSort('value')}
                              className="flex items-center gap-2 hover:text-white transition-colors"
                            >
                              Value
                              {getSortIcon('value')}
                            </button>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => {
                          const isExpanded = expandedRows.has(item.id)
                          const hasCustomFields = item.customFields && Object.keys(item.customFields).length > 0
                          
                          return (
                            <React.Fragment key={item.id}>
                              <tr 
                                className={`${!isExpanded ? 'border-b border-gray-800' : ''} ${
                                  hasCustomFields 
                                    ? 'hover:bg-gray-800 cursor-pointer' 
                                    : 'hover:bg-gray-800'
                                }`}
                                onClick={(e) => handleRowClick(e, item)}
                                title={hasCustomFields ? (isExpanded ? "Click to hide details" : "Click to show more details") : ""}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    {item.itemName}
                                    {hasCustomFields && (
                                      <span className="text-gray-500">
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      </span>
                                    )}
                                  </div>
                                </td>
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
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditItem(item.id)
                                      }}
                                      className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-700 transition-colors"
                                      title="Edit item"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteItem(item.id, item.itemName)
                                      }}
                                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-700 transition-colors"
                                      title="Delete item"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && hasCustomFields && (
                                <tr className="border-b border-gray-800">
                                  <td colSpan="5" className="py-3 px-4">
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Filter Products</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6">
              {/* Stock Status Filters */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">📦 Stock Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.stockStatus.includes("inStock")}
                      onChange={() => handleFilterChange("stockStatus", "inStock")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">In Stock (≥10 items)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.stockStatus.includes("lowStock")}
                      onChange={() => handleFilterChange("stockStatus", "lowStock")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Low Stock (1-9 items)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.stockStatus.includes("outOfStock")}
                      onChange={() => handleFilterChange("stockStatus", "outOfStock")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Out of Stock (0 items)</span>
                  </label>
                </div>
              </div>

              {/* Price Range Filters */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">💰 Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes("0to50")}
                      onChange={() => handleFilterChange("priceRange", "0to50")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">₹0 - ₹50</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes("51to100")}
                      onChange={() => handleFilterChange("priceRange", "51to100")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">₹51 - ₹100</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes("101to500")}
                      onChange={() => handleFilterChange("priceRange", "101to500")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">₹101 - ₹500</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes("501to1000")}
                      onChange={() => handleFilterChange("priceRange", "501to1000")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">₹501 - ₹1,000</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes("above1000")}
                      onChange={() => handleFilterChange("priceRange", "above1000")}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Above ₹1,000</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-700">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Business Chatbot */}
      <AIBusinessChatbot 
        inventoryData={{
          items: filteredItems,
          totalItems: filteredStats.totalItems,
          totalValue: filteredStats.totalValue,
          lowStockItems: filteredStats.lowStockItems
        }}
        onNaturalSearch={handleNaturalSearch}
      />
    </div>
  )
}
