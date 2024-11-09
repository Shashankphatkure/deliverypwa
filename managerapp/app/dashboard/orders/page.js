"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import {
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState({
    pendingOrders: 0,
    activeDeliveries: 0,
    completedToday: 0,
    todayRevenue: 0,
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [activeTab]);

  async function fetchStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get pending orders count
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("status", "pending");

      // Get active deliveries count (picked_up status)
      const { count: activeCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("status", "picked_up");

      // Get today's completed orders and revenue
      const { data: todayOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "delivered")
        .gte("created_at", today.toISOString());

      const completedToday = todayOrders?.length || 0;
      const todayRevenue =
        todayOrders?.reduce(
          (sum, order) => sum + (parseFloat(order.total_amount) || 0),
          0
        ) || 0;

      setStats({
        pendingOrders: pendingCount || 0,
        activeDeliveries: activeCount || 0,
        completedToday,
        todayRevenue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          users (full_name, phone),
          stores (name),
          delivery_assignments (
            id,
            delivery_personnel (id, full_name)
          )
        `
        )
        .eq("status", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      picked_up: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const statsCards = [
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: ClockIcon,
      color: "yellow",
    },
    {
      title: "Active Deliveries",
      value: stats.activeDeliveries,
      icon: TruckIcon,
      color: "blue",
    },
    {
      title: "Today's Completed",
      value: stats.completedToday,
      icon: CheckCircleIcon,
      color: "green",
    },
    {
      title: "Today's Revenue",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: BanknotesIcon,
      color: "purple",
    },
  ];

  return (
    <DashboardLayout
      title="Orders"
      actions={
        <Link href="/dashboard/orders/new" className="dashboard-button-primary">
          Create New Order
        </Link>
      }
    >
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card) => (
            <div key={card.title} className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#605e5c]">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold mt-2 text-[#323130]">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex mb-6 bg-[#f3f2f1] rounded-lg p-1">
          {[
            "pending",
            "confirmed",
            "preparing",
            "picked_up",
            "delivered",
            "cancelled",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex-1 py-2 px-4 rounded-lg capitalize transition-all duration-200 ${
                activeTab === status
                  ? "bg-white shadow-md font-medium text-[#323130]"
                  : "text-[#605e5c] hover:bg-white/50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-16 bg-[#f3f2f1] rounded"
                />
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#edebe9]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{order.users?.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {order.users?.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{order.stores?.name}</td>
                    <td className="px-6 py-4">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {order.delivery_assignments?.[0]?.delivery_personnel
                        ?.full_name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-x-2">
                        <Link
                          href={`/dashboard/orders/${order.id}/view`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        {order.status === "pending" &&
                          !order.delivery_assignments?.[0] && (
                            <Link
                              href={`/dashboard/orders/${order.id}/assign`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Assign
                            </Link>
                          )}
                        {order.status === "pending" &&
                          order.delivery_assignments?.[0] && (
                            <Link
                              href={`/dashboard/orders/${order.id}/transfer`}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Transfer
                            </Link>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-[#605e5c]" />
              <h3 className="mt-2 text-sm font-medium text-[#323130]">
                No {activeTab} orders found
              </h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
