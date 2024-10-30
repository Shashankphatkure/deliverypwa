"use client";
import Link from "next/link";
import { useState } from "react";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("active");

  const ordersByStatus = {
    active: [
      { id: "1234", status: "In Progress", amount: "₹950.00", time: "30 mins" },
      { id: "1235", status: "Picked Up", amount: "₹850.00", time: "25 mins" },
    ],
    completed: [
      {
        id: "1230",
        status: "Completed",
        amount: "₹750.00",
        date: "Today, 2:30 PM",
      },
      {
        id: "1231",
        status: "Completed",
        amount: "₹1200.00",
        date: "Today, 1:15 PM",
      },
      { id: "1232", status: "Completed", amount: "₹950.00", date: "Yesterday" },
    ],
    cancelled: [
      {
        id: "1228",
        status: "Cancelled",
        amount: "₹0.00",
        date: "Today, 3:45 PM",
        reason: "Customer unavailable",
      },
      {
        id: "1229",
        status: "Cancelled",
        amount: "₹0.00",
        date: "Yesterday",
        reason: "Restaurant closed",
      },
    ],
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {/* Order Tabs */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "active"
              ? "bg-white font-medium shadow"
              : "text-gray-600"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "completed"
              ? "bg-white font-medium shadow"
              : "text-gray-600"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "cancelled"
              ? "bg-white font-medium shadow"
              : "text-gray-600"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersByStatus[activeTab].map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    order.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
                <h3 className="font-medium mt-2">Order #{order.id}</h3>
              </div>
              <span className="text-lg font-bold">{order.amount}</span>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-3">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {order.time || order.date}
                {order.reason && ` • ${order.reason}`}
              </span>
            </div>

            <div className="border-t pt-3">
              <Link
                href={`/orders/${order.id}`}
                className="w-full bg-blue-500 text-white py-2 rounded-lg text-center block"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}

        {ordersByStatus[activeTab].length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No {activeTab} orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
