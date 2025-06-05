"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaGoogle, FaApple } from "react-icons/fa"

export default function Login() {
  return (
    <div className="space-y-4">
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button className="w-full">Log In</Button>
      <div className="flex justify-between">
        <Button variant="outline" className="flex items-center">
          <FaGoogle className="mr-2" />
          Sign in with Google
        </Button>
        <Button variant="outline" className="flex items-center">
          <FaApple className="mr-2" />
          Sign in with Apple
        </Button>
      </div>
    </div>
  )
}
