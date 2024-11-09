"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stores, setStores] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");

  const [order, setOrder] = useState({
    user_id: "",
    store_id: "",
    delivery_address: "",
    delivery_notes: "",
    total_amount: 0,
    items: [{ menu_item_id: "", quantity: 1, price: 0 }],
  });

  useEffect(() => {
    fetchCustomers();
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchMenuItems(selectedStoreId);
    }
  }, [selectedStoreId]);

  async function fetchCustomers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, phone")
        .order("full_name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }

  async function fetchStores() {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMenuItems(storeId) {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, price")
        .eq("store_id", storeId)
        .eq("is_available", true)
        .order("name");

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    setSelectedStoreId(storeId);
    setOrder({
      ...order,
      store_id: storeId,
      items: [{ menu_item_id: "", quantity: 1, price: 0 }],
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...order.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === "menu_item_id") {
      const menuItem = menuItems.find((item) => item.id === value);
      updatedItems[index].price = menuItem ? menuItem.price : 0;
    }

    const total = updatedItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    setOrder({
      ...order,
      items: updatedItems,
      total_amount: total,
    });
  };

  const addItem = () => {
    setOrder({
      ...order,
      items: [...order.items, { menu_item_id: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const updatedItems = order.items.filter((_, i) => i !== index);
    const total = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setOrder({
      ...order,
      items: updatedItems,
      total_amount: total,
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: order.user_id,
            store_id: order.store_id,
            delivery_address: order.delivery_address,
            delivery_notes: order.delivery_notes,
            total_amount: order.total_amount,
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
        price_at_time: item.price,
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
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select
            value={order.user_id}
            onChange={(e) => setOrder({ ...order, user_id: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name} ({customer.phone})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Store</label>
          <select
            value={order.store_id}
            onChange={handleStoreChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {order.store_id && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Order Items
            </label>
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={item.menu_item_id}
                  onChange={(e) =>
                    handleItemChange(index, "menu_item_id", e.target.value)
                  }
                  className="flex-1 p-2 border rounded"
                  required
                >
                  <option value="">Select Item</option>
                  {menuItems.map((menuItem) => (
                    <option key={menuItem.id} value={menuItem.id}>
                      {menuItem.name} (${menuItem.price})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-20 p-2 border rounded"
                  required
                />
                {order.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-blue-500 hover:text-blue-600"
            >
              + Add Item
            </button>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Total Amount</label>
          <input
            type="text"
            value={`$${order.total_amount.toFixed(2)}`}
            className="w-full p-2 border rounded bg-gray-50"
            disabled
          />
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
            rows={3}
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
            rows={2}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {submitting ? "Creating..." : "Create Order"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/orders")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
