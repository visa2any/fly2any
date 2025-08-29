import React from 'react';
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export default function SignIn() {
  async function handleSignIn(formData: FormData) {
    "use server"
    try {
      await signIn("github", { redirectTo: "/dashboard" })
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(`/auth/error?error=${error.type}`)
      }
      throw error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <form action={handleSignIn} className="mt-8 space-y-6">
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    </div>
  )
}