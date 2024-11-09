"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

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

  const formFields = [
    {
      label: "Customer",
      type: "select",
      value: order.user_id,
      onChange: (value) => setOrder({ ...order, user_id: value }),
      icon: UserGroupIcon,
      options: customers.map((customer) => ({
        value: customer.id,
        label: `${customer.full_name} (${customer.phone})`,
      })),
      required: true,
    },
    {
      label: "Store",
      type: "select",
      value: order.store_id,
      onChange: handleStoreChange,
      icon: BuildingStorefrontIcon,
      options: stores.map((store) => ({
        value: store.id,
        label: store.name,
      })),
      required: true,
    },
    {
      label: "Delivery Address",
      type: "textarea",
      value: order.delivery_address,
      onChange: (value) => setOrder({ ...order, delivery_address: value }),
      icon: MapPinIcon,
      required: true,
    },
    {
      label: "Delivery Notes",
      type: "textarea",
      value: order.delivery_notes,
      onChange: (value) => setOrder({ ...order, delivery_notes: value }),
      icon: DocumentTextIcon,
    },
  ];

  return (
    <DashboardLayout
      title="Create New Order"
      actions={
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="dashboard-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Orders
        </button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto p-6"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/50 rounded-xl h-16 backdrop-blur-lg"
              />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formFields.map((field) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="dashboard-card"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <field.icon className="h-5 w-5 text-gray-400" />
                  </div>
                  {field.type === "select" ? (
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="dashboard-input pl-10"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <textarea
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="dashboard-input pl-10"
                      rows={field.type === "textarea" ? 3 : 1}
                      required={field.required}
                    />
                  )}
                </div>
              </motion.div>
            ))}

            {order.store_id && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="dashboard-card"
              >
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Items
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="dashboard-button-secondary flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <select
                          value={item.menu_item_id}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "menu_item_id",
                              e.target.value
                            )
                          }
                          className="dashboard-input"
                          required
                        >
                          <option value="">Select Item</option>
                          {menuItems.map((menuItem) => (
                            <option key={menuItem.id} value={menuItem.id}>
                              {menuItem.name} (${menuItem.price})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
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
                          className="dashboard-input"
                          required
                        />
                      </div>
                      {order.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="dashboard-card"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <div className="flex items-center text-lg font-semibold">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-1" />
                  {order.total_amount.toFixed(2)}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end space-x-4"
            >
              <button
                type="submit"
                disabled={submitting}
                className="dashboard-button-primary flex items-center gap-2"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {submitting ? "Creating..." : "Create Order"}
              </button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
