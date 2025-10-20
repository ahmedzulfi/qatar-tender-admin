// "use client";

// import { ProtectedRoute } from "@/components/auth-guard";
// import { SettingsContent } from "@/components/settings-content";
// import { useAdminAuth } from "@/context/AdminAuthProvider";
// import { useAuth } from "@/context/AuthContext";
// import { useEffect } from "react";

// export default function SettingsPage() {
//   const { user } = useAuth();
//   if(user.adminType == "super"){
//     then stay , else route back
//   }
//   return (
//     <ProtectedRoute allowedUserTypes={["admin"]}>
//       <SettingsContent />
//     </ProtectedRoute>
//   );
// }
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth-guard";
import { SettingsContent } from "@/components/settings-content";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("my secret code", user);
    if (user?.adminType !== "super") {
      router.replace("/admin");
    }
  }, [user, router]);

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <SettingsContent />
    </ProtectedRoute>
  );
}
