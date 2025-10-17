"use client";
import { AdminControlsContent } from "@/components/admin-controls-content";
import { Suspense } from "react";

export default function AdminControlsPage() {
  return (
    <Suspense fallback={<div>Loading admin controls...</div>}>
      <AdminControlsContent />
    </Suspense>
  );
}
