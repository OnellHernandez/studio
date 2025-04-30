"use client";

import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import InventoryPage from "@/app/inventory/page"; // Import the inventory page component

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    // You can return a loading skeleton here if preferred
    return <div>Loading authentication status...</div>;
  }

  return (
    <div>
      {user ? <InventoryPage /> : <LoginForm />}
    </div>
  );
}
