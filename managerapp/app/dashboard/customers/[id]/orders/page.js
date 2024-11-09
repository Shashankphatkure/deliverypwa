"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CustomerOrdersPage({ params }) {
  const { id } = params;
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCustomerAndOrders();
  }, [id]);

  async function fetchCustomerAndOrders() {
    try {
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Fetch orders with store details and reviews
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          store:stores(name),
          reviews:reviews(store_rating, delivery_rating, comment),
          delivery_assignments(
            delivery_personnel:delivery_personnel(full_name)
          )
        `
        )
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;
      setOrders(orderData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!customer) return <div className="p-6">Customer not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders for {customer.full_name}</h1>
        <p className="text-gray-600">{customer.email}</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-gray-600">{order.store.name}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p>{order.delivery_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p>${order.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Driver</p>
                <p>
                  {order.delivery_assignments[0]?.delivery_personnel
                    ?.full_name || "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p>{new Date(order.created_at).toLocaleString()}</p>
              </div>
            </div>

            {order.reviews && order.reviews[0] && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Customer Review</h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Store Rating</p>
                    <p>{order.reviews[0].store_rating}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Rating</p>
                    <p>{order.reviews[0].delivery_rating}/5</p>
                  </div>
                </div>
                {order.reviews[0].comment && (
                  <p className="text-gray-700">{order.reviews[0].comment}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No orders found for this customer
          </p>
        )}
      </div>
    </div>
  );
}
