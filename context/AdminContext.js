// context/AdminContext.js
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { adminLogin as adminLoginService } from "@/services/adminService";
import { useRouter } from "next/navigation";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email, password, securityCode) => {
      try {
        setIsLoading(true);
        const data = await adminLoginService(email, password, securityCode);

        // Store admin data
        setAdmin(data.user);
        localStorage.setItem("admin", JSON.stringify(data.user));

        // Redirect based on admin type
        if (data.user.adminType === "super") {
          router.push("/admin/super");
        } else {
          router.push("/admin/dashboard");
        }

        return { success: true };
      } catch (error) {
        console.error("Admin login error:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Login failed",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin");
    setAdmin(null);
    router.push("/admin/login");
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
