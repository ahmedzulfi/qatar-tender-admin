"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthProvider";

export default function LoginForm() {
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState("");

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/admin");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password || !securityCode) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const result = await login(email.trim(), password, securityCode);
      if (!result?.success) {
        setError(result?.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred. Try again.");
      // optionally: console.error(err);
    }
  };

  // while redirecting, avoid rendering the form
  if (isAuthenticated && !isLoading) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl px-6 py-8">
      <div>
        <h3 className="text-center text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Login
        </h3>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Sign in to manage the platform
        </p>
      </div>

      {error && (
        <div
          className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <span className="block">{error}</span>
        </div>
      )}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email address"
              aria-invalid={!!error}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password"
            />
          </div>

          <div>
            <label htmlFor="security-code" className="sr-only">
              Security Code
            </label>
            <input
              id="security-code"
              name="security-code"
              type="password"
              required
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Security Code"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-busy={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </div>

        <div className="text-sm text-center">
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to main site
          </Link>
        </div>
      </form>
    </div>
  );
}
