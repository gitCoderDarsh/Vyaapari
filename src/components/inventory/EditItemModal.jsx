"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditItemModal({ isOpen, onClose, onSuccess, showToast, itemId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    stockQuantity: 0,
    itemPrice: 0
  })
  const [customFields, setCustomFields] = useState([])

  // Fetch item data when modal opens
  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemData()
    }
  }, [isOpen, itemId])

  const fetchItemData = async () => {
    try {
      setIsFetching(true)
      const response = await fetch(`/api/inventory/${itemId}`)
      if (response.ok) {
        const data = await response.json()
        const item = data.item
        
        setFormData({
          itemName: item.itemName,
          stockQuantity: item.stockQuantity,
          itemPrice: Number(item.itemPrice)
        })

        // Convert customFields object to array format
        const customFieldsArray = Object.entries(item.customFields || {}).map(([key, value]) => ({
          key,
          value
        }))
        setCustomFields(customFieldsArray)
      } else {
        showToast('Failed to fetch item data', 'error')
        onClose()
      }
    } catch (error) {
      console.error('Fetch item error:', error)
      showToast('Error loading item data', 'error')
      onClose()
    } finally {
      setIsFetching(false)
    }
  }

  // Handle basic form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Add new custom field
  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }])
  }

  // Update custom field
  const updateCustomField = (index, field, value) => {
    setCustomFields(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  // Remove custom field
  const removeCustomField = (index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      itemName: '',
      stockQuantity: 0,
      itemPrice: 0
    })
    setCustomFields([])
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.itemName.trim()) {
      showToast('Item name is required', 'error')
      return
    }
    
    if (formData.stockQuantity < 0) {
      showToast('Stock quantity cannot be negative', 'error')
      return
    }
    
    if (formData.itemPrice <= 0) {
      showToast('Item price must be greater than 0', 'error')
      return
    }

    setIsLoading(true)

    try {
      // Prepare custom fields object
      const customFieldsObj = {}
      customFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          customFieldsObj[field.key.trim()] = field.value.trim()
        }
      })

      // Submit to API
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName: formData.itemName.trim(),
          stockQuantity: parseInt(formData.stockQuantity),
          itemPrice: parseFloat(formData.itemPrice),
          customFields: customFieldsObj
        }),
      })

      const result = await response.json()

      if (response.ok) {
        showToast('Item updated successfully!', 'success')
        onSuccess() // Refresh the inventory list
        onClose() // Close the modal
      } else {
        showToast(`Failed to update item: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Update item error:', error)
      showToast('An error occurred while updating the item', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Item</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        {isFetching ? (
          <div className="p-6 text-center">
            <div className="text-gray-400">Loading item data...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-gray-300">
                Item Name *
              </Label>
              <Input
                id="itemName"
                type="text"
                placeholder="Enter item name"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                required
              />
            </div>

            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity" className="text-gray-300">
                Stock Quantity *
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                placeholder="Enter stock quantity"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                required
              />
            </div>

            {/* Item Price */}
            <div className="space-y-2">
              <Label htmlFor="itemPrice" className="text-gray-300">
                Item Price (₹) *
              </Label>
              <Input
                id="itemPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter item price"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                value={formData.itemPrice}
                onChange={(e) => handleInputChange('itemPrice', e.target.value)}
                required
              />
            </div>

            {/* Custom Fields Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Custom Fields</Label>
                <Button
                  type="button"
                  onClick={addCustomField}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 h-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>

              {customFields.map((field, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Field name"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white flex-1"
                    value={field.key}
                    onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Field value"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white flex-1"
                    value={field.value}
                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-white text-black hover:bg-gray-100"
              >
                {isLoading ? 'Updating...' : 'Update Item'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
