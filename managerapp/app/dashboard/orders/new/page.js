"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [order, setOrder] = useState({
    customer_id: "",
    store_id: "",
    delivery_address: "",
    delivery_notes: "",
    items: [{ menu_item_id: "", quantity: 1 }],
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: order.customer_id,
            store_id: order.store_id,
            delivery_address: order.delivery_address,
            delivery_notes: order.delivery_notes,
            status: "pending",
            payment_status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = order.items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        {/* Add form fields for order creation */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select
            value={order.customer_id}
            onChange={(e) =>
              setOrder({ ...order, customer_id: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Customer</option>
            {/* Add customer options */}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Store</label>
          <select
            value={order.store_id}
            onChange={(e) => setOrder({ ...order, store_id: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Store</option>
            {/* Add store options */}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Delivery Address
          </label>
          <textarea
            value={order.delivery_address}
            onChange={(e) =>
              setOrder({ ...order, delivery_address: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Delivery Notes
          </label>
          <textarea
            value={order.delivery_notes}
            onChange={(e) =>
              setOrder({ ...order, delivery_notes: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Creating..." : "Create Order"}
        </button>
      </form>
    </div>
  );
}
