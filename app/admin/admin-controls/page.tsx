"use client";
import { Suspense } from "react";
import { AdminControlsContent } from "@/components/admin-controls-content";

export default function AdminControlsPage() {
  return (
    <Suspense fallback={<div>Loading admin controls...</div>}>
      <AdminControlsContent />
    </Suspense>
  );
}
