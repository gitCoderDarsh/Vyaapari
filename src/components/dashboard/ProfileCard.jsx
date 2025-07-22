"use client"

import { useState, useEffect } from "react"
import LogoSection from "./LogoSection"

export default function ProfileCard({
  profileData,
  editData,
  isEditing,
  handleEdit,
  handleCancel,
  handleConfirm,
  handleInputChange
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
      <LogoSection 
        isEditing={isEditing}
        logo={isEditing ? editData.logo : profileData.logo}
      />

      {/* Business Information */}
      <div className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Business Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors placeholder:text-gray-500"
              placeholder="Enter business name"
            />
          ) : (
            <p className="text-xl font-semibold text-white">{profileData.businessName}</p>
          )}
        </div>

        {/* First Name & Last Name */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors placeholder:text-gray-500"
                placeholder="Enter first name"
              />
            ) : (
              <p className="text-gray-300">{profileData.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors placeholder:text-gray-500"
                placeholder="Enter last name"
              />
            ) : (
              <p className="text-gray-300">{profileData.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
          {isEditing ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors placeholder:text-gray-500"
              placeholder="Enter email address"
            />
          ) : (
            <p className="text-gray-300">{profileData.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors placeholder:text-gray-500"
              placeholder="Enter phone number"
            />
          ) : (
            <p className="text-gray-300">{profileData.phone}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-transparent border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Confirm Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="w-full sm:w-auto px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
