"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <a
          href="/dashboard/orders/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Order
        </a>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-2xl font-bold">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Active Deliveries
          </h3>
          <p className="text-2xl font-bold">{stats.activeDeliveries}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Today's Completed
          </h3>
          <p className="text-2xl font-bold">{stats.completedToday}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
          <p className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
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
            className={`flex-1 py-2 px-4 rounded-lg capitalize ${
              activeTab === status
                ? "bg-white shadow font-medium"
                : "text-gray-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
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

          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No {activeTab} orders found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
