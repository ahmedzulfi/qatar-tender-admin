import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Qatar Tender Platform</h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-600 dark:text-gray-300">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to access the admin dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
