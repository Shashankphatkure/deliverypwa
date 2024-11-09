"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  TagIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  ArrowLeftIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function NewMenuItemPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });

  const [item, setItem] = useState({
    name: "",
    description: "",
    price: "",
    store_id: "",
    category_id: "",
    image_url: "",
    is_available: true,
  });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (item.store_id) {
      fetchCategories(item.store_id);
    }
  }, [item.store_id]);

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
      console.error("Error fetching stores:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories(storeId) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("store_id", storeId)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  }

  async function handleCreateCategory() {
    if (!item.store_id) {
      alert("Please select a store first");
      return;
    }

    if (!newCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            name: newCategory.name,
            store_id: item.store_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh categories and update the current item
      await fetchCategories(item.store_id);
      setItem({ ...item, category_id: data.id });
      setShowCategoryModal(false);
      setNewCategory({ name: "" });
    } catch (error) {
      console.error("Error creating category:", error.message);
      alert("Error creating category. Please try again.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("menu_items")
        .insert([
          {
            ...item,
            price: parseFloat(item.price),
            category_id: item.category_id || null, // Handle empty category
          },
        ])
        .select()
        .single();

      if (error) throw error;
      router.push("/dashboard/items");
    } catch (error) {
      console.error("Error creating menu item:", error.message);
      alert(error.message || "Error creating menu item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const formFields = [
    {
      label: "Store",
      type: "select",
      value: item.store_id,
      onChange: (value) => setItem({ ...item, store_id: value }),
      icon: BuildingStorefrontIcon,
      options: stores.map((store) => ({
        value: store.id,
        label: store.name,
      })),
      required: true,
    },
    {
      label: "Category",
      type: "select",
      value: item.category_id,
      onChange: (value) => setItem({ ...item, category_id: value }),
      icon: TagIcon,
      options: categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
      addNew: {
        label: "Add New Category",
        action: () => setShowCategoryModal(true),
      },
    },
    {
      label: "Item Name",
      type: "text",
      value: item.name,
      onChange: (value) => setItem({ ...item, name: value }),
      icon: ShoppingBagIcon,
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      value: item.description,
      onChange: (value) => setItem({ ...item, description: value }),
      icon: DocumentTextIcon,
    },
    {
      label: "Price",
      type: "number",
      value: item.price,
      onChange: (value) => setItem({ ...item, price: value }),
      icon: CurrencyDollarIcon,
      prefix: "$",
      required: true,
    },
    {
      label: "Image URL",
      type: "url",
      value: item.image_url,
      onChange: (value) => setItem({ ...item, image_url: value }),
      icon: PhotoIcon,
      placeholder: "https://...",
    },
  ];

  return (
    <DashboardLayout
      title="Add New Menu Item"
      actions={
        <button
          onClick={() => router.push("/dashboard/items")}
          className="dashboard-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Items
        </button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {field.addNew && (
                    <button
                      type="button"
                      onClick={field.addNew.action}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" />
                      {field.addNew.label}
                    </button>
                  )}
                </div>
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
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="dashboard-input pl-10"
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <div className="relative">
                      {field.prefix && (
                        <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                          <span className="text-gray-500">{field.prefix}</span>
                        </div>
                      )}
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className={`dashboard-input ${
                          field.prefix ? "pl-14" : "pl-10"
                        }`}
                        required={field.required}
                        placeholder={field.placeholder}
                        step={field.type === "number" ? "0.01" : undefined}
                        min={field.type === "number" ? "0" : undefined}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="dashboard-card"
            >
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.is_available}
                  onChange={(e) =>
                    setItem({ ...item, is_available: e.target.checked })
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Available for Order
                </span>
              </label>
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
                {submitting ? "Adding..." : "Add Item"}
              </button>
            </motion.div>
          </form>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white p-6 rounded-xl w-96 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4">Add New Category</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="dashboard-input"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="dashboard-button-primary flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="dashboard-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
