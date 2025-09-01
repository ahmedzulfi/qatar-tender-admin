import { AdminAuthGuard } from "@/utils/AdminAuthGuard";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <AdminAuthGuard>
      <>Hello</>
    </AdminAuthGuard>
  );
}
