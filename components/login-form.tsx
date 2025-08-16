"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, Mail, Lock, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";

import { useTranslation } from '../lib/hooks/useTranslation';
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "2fa" | "forgot">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
    resetEmail: "",
  });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      if (
        formData.email === "admin@qatartender.com" &&
        formData.password === "admin123"
      ) {
        setStep("2fa");
      } else {
        setError("Invalid email or password");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate 2FA verification
    setTimeout(() => {
      if (formData.twoFactorCode === "123456") {
        router.push("/admin");
      } else {
        setError("Invalid 2FA code");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate password reset
    setTimeout(() => {
      setError("");
      alert("Password reset link sent to your email");
      setStep("login");
      setIsLoading(false);
    }, 1000);
  };
      const { t } = useTranslation();

  const updateFormData = (field: string, value: string) => {

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (step === "forgot") {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('reset_password')}</CardTitle>
          <CardDescription>
            {t('enter_your_email_address_and_well_send_you_a_reset')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">{t('email_address')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@qatartender.com"
                  value={formData.resetEmail}
                  onChange={(e) => updateFormData("resetEmail", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("login")}
            >
              {t('back_to_login')}</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "2fa") {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {t('twofactor_authentication')}</CardTitle>
          <CardDescription className="text-center">
            {t('enter_the_6digit_code_from_your_authenticator_app')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTwoFactor} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="2fa-code">{t('authentication_code')}</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="2fa-code"
                  type="text"
                  placeholder="123456"
                  value={formData.twoFactorCode}
                  onChange={(e) =>
                    updateFormData("twoFactorCode", e.target.value)
                  }
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("login")}
            >
              {t('back_to_login')}</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('sign_in')}</CardTitle>
        <CardDescription>
          {t('enter_your_credentials_to_access_the_admin_dashboa')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('email_address')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@qatartender.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('enter_your_password')}
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              className="px-0 font-normal"
              onClick={() => setStep("forgot")}
            >
              Forgot password?
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Demo credentials: admin@qatartender.com / admin123
            <br />
            2FA Code: 123456
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
