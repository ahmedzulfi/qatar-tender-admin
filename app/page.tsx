import { ProtectedRoute } from "@/components/auth-guard";
import { AuthProvider } from "@/context/AuthContext";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <>
      aaa
      <AuthProvider>
        <ProtectedRoute allowedUserTypes={["admin"]}>
          <div className="div">
            <Link href={"/admin"}>GO To Admin</Link>
          </div>
        </ProtectedRoute>
      </AuthProvider>
    </>
  );
}
