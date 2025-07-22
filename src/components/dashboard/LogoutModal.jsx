"use client"

export default function LogoutModal({ showLogoutModal, setShowLogoutModal, handleLogout }) {
  if (!showLogoutModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Are you sure you want to logout?</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 px-4 py-2 bg-transparent border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ❌ Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            ✅ Yes
          </button>
        </div>
      </div>
    </div>
  )
}
