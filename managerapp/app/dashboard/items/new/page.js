"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Menu Item</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Store</label>
          <select
            value={item.store_id}
            onChange={(e) => setItem({ ...item, store_id: e.target.value })}
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

        {item.store_id && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Category</label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                + Add New Category
              </button>
            </div>
            <select
              value={item.category_id}
              onChange={(e) =>
                setItem({ ...item, category_id: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={item.price}
            onChange={(e) => setItem({ ...item, price: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            value={item.image_url}
            onChange={(e) => setItem({ ...item, image_url: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="https://..."
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={item.is_available}
              onChange={(e) =>
                setItem({ ...item, is_available: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm font-medium">Available for Order</span>
          </label>
        </div>

        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
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
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {submitting ? "Adding..." : "Add Item"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/items")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
