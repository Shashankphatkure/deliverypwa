"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order #{id.slice(0, 8)}</h1>
        <div className="space-x-2">
          {order.status === "pending" && !order.delivery_assignments?.[0] && (
            <Link
              href={`/dashboard/orders/${id}/assign`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Assign Driver
            </Link>
          )}
          {order.status === "pending" && order.delivery_assignments?.[0] && (
            <Link
              href={`/dashboard/orders/${id}/transfer`}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Transfer Order
            </Link>
          )}
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
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
            <div className="flex justify-between">
              <span className="text-gray-600">Created At:</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-600">Name:</span>{" "}
              {order.users?.full_name}
            </p>
            <p>
              <span className="text-gray-600">Phone:</span> {order.users?.phone}
            </p>
            <p>
              <span className="text-gray-600">Delivery Address:</span>{" "}
              {order.delivery_address}
            </p>
            {order.delivery_notes && (
              <p>
                <span className="text-gray-600">Notes:</span>{" "}
                {order.delivery_notes}
              </p>
            )}
          </div>
        </div>

        {/* Store Details */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Store Details</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-600">Name:</span> {order.stores?.name}
            </p>
            <p>
              <span className="text-gray-600">Address:</span>{" "}
              {order.stores?.address}
            </p>
            <p>
              <span className="text-gray-600">Phone:</span>{" "}
              {order.stores?.phone}
            </p>
          </div>
        </div>

        {/* Driver Details */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
          {order.delivery_assignments?.[0] ? (
            <div className="space-y-2">
              <p>
                <span className="text-gray-600">Driver:</span>
                {order.delivery_assignments[0].delivery_personnel?.full_name}
              </p>
              <p>
                <span className="text-gray-600">Driver Phone:</span>
                {order.delivery_assignments[0].delivery_personnel?.phone}
              </p>
              <p>
                <span className="text-gray-600">Pickup Time:</span>
                {order.delivery_assignments[0].pickup_time
                  ? new Date(
                      order.delivery_assignments[0].pickup_time
                    ).toLocaleString()
                  : "Not picked up yet"}
              </p>
              <p>
                <span className="text-gray-600">Delivery Time:</span>
                {order.delivery_assignments[0].delivery_time
                  ? new Date(
                      order.delivery_assignments[0].delivery_time
                    ).toLocaleString()
                  : "Not delivered yet"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No driver assigned yet</p>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
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
        </div>
      </div>
    </div>
  );
}
