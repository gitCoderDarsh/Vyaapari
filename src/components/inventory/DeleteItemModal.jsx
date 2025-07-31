"use client"

import { useState } from "react"
import { Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DeleteItemModal({ isOpen, onClose, onConfirm, itemName, isLoading }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Delete Item</h2>
              <p className="text-gray-400 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            Are you sure you want to delete <span className="font-semibold text-white">"{itemName}"</span>? 
            This will permanently remove the item from your inventory.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Deleting...'
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Item
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
