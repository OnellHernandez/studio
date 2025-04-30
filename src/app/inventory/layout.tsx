import ProtectedLayout from "@/app/(protected)/layout";
import type { ReactNode } from "react";

export default function InventoryLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
