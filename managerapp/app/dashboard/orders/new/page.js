"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ShoppingBagIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
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
      subtitle="Create a new order for your customers"
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
      <div className="max-w-3xl mx-auto p-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-[#f3f2f1] rounded-lg h-16"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#edebe9] rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formFields.map((field) => (
                <div key={field.label} className="space-y-2">
                  <label className="text-sm font-semibold text-[#323130]">
                    {field.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <field.icon className="h-5 w-5 text-[#605e5c]" />
                    </div>
                    {field.type === "select" ? (
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="block w-full rounded-md border border-[#8a8886] pl-10 py-2 text-sm focus:border-[#0078d4] focus:ring-[#0078d4]"
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
                        className="block w-full rounded-md border border-[#8a8886] pl-10 py-2 text-sm focus:border-[#0078d4] focus:ring-[#0078d4]"
                        rows={field.type === "textarea" ? 3 : 1}
                        required={field.required}
                      />
                    )}
                  </div>
                </div>
              ))}

              {order.store_id && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-[#323130]">
                      Order Items
                    </h3>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-[#0078d4] hover:text-[#106ebe] flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>

                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#faf9f8] rounded-lg space-y-3"
                    >
                      <div className="flex gap-4">
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
                            className="block w-full rounded-md border border-[#8a8886] px-3 py-2 text-sm focus:border-[#0078d4] focus:ring-[#0078d4]"
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
                            className="block w-full rounded-md border border-[#8a8886] px-3 py-2 text-sm focus:border-[#0078d4] focus:ring-[#0078d4]"
                            required
                          />
                        </div>
                        {order.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-[#a4262c] hover:text-[#751d21] p-2"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-[#edebe9]">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-[#323130]">
                    Total Amount
                  </span>
                  <span className="text-lg font-semibold text-[#0078d4]">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/orders")}
                    className="px-4 py-2 text-sm font-medium text-[#323130] bg-white border border-[#8a8886] rounded-md hover:bg-[#f3f2f1] focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0078d4] border border-transparent rounded-md hover:bg-[#106ebe] focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
                  >
                    {submitting ? "Creating..." : "Create Order"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
