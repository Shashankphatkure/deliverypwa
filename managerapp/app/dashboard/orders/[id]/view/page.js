"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { use } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  UserIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function ViewOrderPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClientComponentClient();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          users (full_name, phone),
          stores (name, address, phone),
          order_items (
            quantity,
            price_at_time,
            menu_items (name)
          ),
          delivery_assignments (
            status,
            pickup_time,
            delivery_time,
            delivery_personnel (full_name, phone)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Error fetching order details");
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

  if (loading) {
    return (
      <DashboardLayout title="Order Details">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/50 rounded-xl h-48 backdrop-blur-lg"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout title="Order Details">
        <div className="p-6">
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Order not found
            </h3>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const orderSections = [
    {
      title: "Order Status",
      icon: ClockIcon,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Payment Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                order.payment_status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.payment_status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Created At:</span>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Customer Details",
      icon: UserIcon,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <span>{order.users?.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-gray-400" />
            <span>{order.users?.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            <span>{order.delivery_address}</span>
          </div>
          {order.delivery_notes && (
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              <span>{order.delivery_notes}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Store Details",
      icon: BuildingStorefrontIcon,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BuildingStorefrontIcon className="w-5 h-5 text-gray-400" />
            <span>{order.stores?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            <span>{order.stores?.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-gray-400" />
            <span>{order.stores?.phone}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Delivery Details",
      icon: TruckIcon,
      content: order.delivery_assignments?.[0] ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <span>
              {order.delivery_assignments[0].delivery_personnel?.full_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-gray-400" />
            <span>
              {order.delivery_assignments[0].delivery_personnel?.phone}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <span>
              Pickup:{" "}
              {order.delivery_assignments[0].pickup_time
                ? new Date(
                    order.delivery_assignments[0].pickup_time
                  ).toLocaleString()
                : "Not picked up yet"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <span>
              Delivery:{" "}
              {order.delivery_assignments[0].delivery_time
                ? new Date(
                    order.delivery_assignments[0].delivery_time
                  ).toLocaleString()
                : "Not delivered yet"}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No driver assigned yet</p>
      ),
    },
  ];

  return (
    <DashboardLayout
      title={`Order #${id.slice(0, 8)}`}
      actions={
        <div className="space-x-2">
          {order.status === "pending" && !order.delivery_assignments?.[0] && (
            <Link
              href={`/dashboard/orders/${id}/assign`}
              className="dashboard-button-primary"
            >
              Assign Driver
            </Link>
          )}
          {order.status === "pending" && order.delivery_assignments?.[0] && (
            <Link
              href={`/dashboard/orders/${id}/transfer`}
              className="dashboard-button-secondary"
            >
              Transfer Order
            </Link>
          )}
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="dashboard-button-secondary"
          >
            Back to Orders
          </button>
        </div>
      }
    >
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {orderSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="dashboard-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="w-6 h-6 text-gray-400" />
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              {section.content}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dashboard-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <DocumentTextIcon className="w-6 h-6 text-gray-400" />
            <h2 className="text-lg font-semibold">Order Items</h2>
          </div>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.menu_items?.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${item.price_at_time}</td>
                  <td className="text-right">
                    ${(item.quantity * item.price_at_time).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan={3} className="text-right py-2">
                  Total Amount:
                </td>
                <td className="text-right">${order.total_amount}</td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
