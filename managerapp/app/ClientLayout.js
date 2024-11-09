"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/dashboard/drivers", label: "Drivers", icon: "🚗" },
    { path: "/dashboard/orders", label: "Orders", icon: "📦" },
    { path: "/dashboard/customers", label: "Customers", icon: "👥" },
    { path: "/dashboard/payments", label: "Payments", icon: "💰" },
    { path: "/dashboard/penalties", label: "Penalties", icon: "⚠️" },
    { path: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 ease-in-out`}
      >
        <div className="p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full text-left mb-4"
          >
            {isSidebarOpen ? (
              <h1 className="text-xl font-bold">Manager App</h1>
            ) : (
              <span className="text-xl">📱</span>
            )}
          </button>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center p-2 rounded-lg ${
                  pathname === item.path
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-xl font-semibold">
              {menuItems.find((item) => item.path === pathname)?.label ||
                "Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">🔍</button>
              <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
              <button className="p-2 hover:bg-gray-100 rounded-full">👤</button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
