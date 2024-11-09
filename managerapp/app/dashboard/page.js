"use client";
import dynamic from "next/dynamic";

const DashboardStats = dynamic(() => import("./components/DashboardStats"), {
  ssr: false,
});

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Stores"
          link="/dashboard/stores"
          description="Manage stores and restaurants"
          icon="🏪"
        />
        <DashboardCard
          title="Menu Items"
          link="/dashboard/items"
          description="Manage food items and pricing"
          icon="🍽️"
        />
        <DashboardCard
          title="Orders"
          link="/dashboard/orders"
          description="Manage and track orders"
          icon="📦"
        />
        <DashboardCard
          title="Drivers"
          link="/dashboard/drivers"
          description="Manage delivery personnel"
          icon="🚗"
        />
        <DashboardCard
          title="Customers"
          link="/dashboard/customers"
          description="Manage customers"
          icon="👥"
        />
        <DashboardCard
          title="Penalties"
          link="/dashboard/penalties"
          description="Manage driver penalties"
          icon="⚠️"
        />
        <DashboardCard
          title="Payments"
          link="/dashboard/payments"
          description="Process driver payments"
          icon="💰"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, link, description, icon }) {
  return (
    <a
      href={link}
      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">{icon}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-gray-600">{description}</p>
    </a>
  );
}
