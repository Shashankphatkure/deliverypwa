"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function NewStorePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [submitting, setSubmitting] = useState(false);
  const [store, setStore] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    opening_time: "",
    closing_time: "",
    image_url: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("stores").insert([
        {
          ...store,
          is_active: true,
        },
      ]);

      if (error) throw error;
      router.push("/dashboard/stores");
    } catch (error) {
      console.error("Error creating store:", error);
      alert("Error creating store. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Store</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Store Name</label>
          <input
            type="text"
            value={store.name}
            onChange={(e) => setStore({ ...store, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={store.description}
            onChange={(e) =>
              setStore({ ...store, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            value={store.address}
            onChange={(e) => setStore({ ...store, address: e.target.value })}
            className="w-full p-2 border rounded"
            rows={2}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={store.phone}
            onChange={(e) => setStore({ ...store, phone: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Opening Time
            </label>
            <input
              type="time"
              value={store.opening_time}
              onChange={(e) =>
                setStore({ ...store, opening_time: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Closing Time
            </label>
            <input
              type="time"
              value={store.closing_time}
              onChange={(e) =>
                setStore({ ...store, closing_time: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            value={store.image_url}
            onChange={(e) => setStore({ ...store, image_url: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {submitting ? "Adding..." : "Add Store"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/stores")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
