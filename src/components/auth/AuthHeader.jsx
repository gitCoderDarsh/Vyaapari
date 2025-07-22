import { Building2 } from "lucide-react"

export default function AuthHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-4">
        <Building2 className="w-8 h-8 text-black" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Vyaapari</h1>
      <p className="text-gray-400 text-sm">Manage your business with ease</p>
    </div>
  )
}
