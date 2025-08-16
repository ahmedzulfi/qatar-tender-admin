"use client";
import { LoginForm } from "@/components/login-form";

import { useTranslation } from "../../lib/hooks/useTranslation";
export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("qatar_tender_platform")}
          </h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-600 dark:text-gray-300">
            {t("admin_portal")}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("sign_in_to_access_the_admin_dashboard")}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
