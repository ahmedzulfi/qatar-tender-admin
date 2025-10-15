import { ProtectedRoute } from "@/components/auth-guard";
import { SettingsContent } from "@/components/settings-content";

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedUserTypes={["admin"]} allowedAdminTypes={["super"]}>
      <SettingsContent />
    </ProtectedRoute>
  );
}
