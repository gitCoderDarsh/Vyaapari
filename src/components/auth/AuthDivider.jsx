import { Separator } from "@/components/ui/separator"
import GoogleButton from "@/components/auth/GoogleButton"

export default function AuthDivider() {
  return (
    <>
      <div className="relative">
        <Separator className="bg-gray-700" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-gray-900 px-2 text-xs text-gray-400">OR</span>
        </div>
      </div>

      <GoogleButton />
    </>
  )
}
