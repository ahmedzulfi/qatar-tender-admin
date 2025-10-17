import { ProtectedRoute } from "@/components/auth-guard";
import { AuthProvider } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function Home() {
  // Redirect immediately when this page is loaded
  redirect("/admin");

  return (
    <AuthProvider>
      <ProtectedRoute allowedUserTypes={["i"]}>
        <div className="div">
          <p>Redirecting...</p>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
