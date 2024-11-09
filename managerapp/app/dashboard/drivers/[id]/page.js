"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function DriverDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const supabase = createClientComponentClient();
  const [driver, setDriver] = useState({
    full_name: "",
    email: "",
    phone: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id !== "new") {
      fetchDriver();
    } else {
      setLoading(false);
    }
  }, [id]);

  async function fetchDriver() {
    try {
      const { data, error } = await supabase
        .from("delivery_personnel")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) setDriver(data);
    } catch (error) {
      console.error("Error fetching driver:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      if (id === "new") {
        const { error } = await supabase
          .from("delivery_personnel")
          .insert([driver]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("delivery_personnel")
          .update(driver)
          .eq("id", id);
        if (error) throw error;
      }

      router.push("/dashboard/drivers");
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Error saving driver. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {id === "new" ? "Add New Driver" : "Edit Driver"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={driver.full_name}
            onChange={(e) =>
              setDriver({ ...driver, full_name: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={driver.email}
            onChange={(e) => setDriver({ ...driver, email: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={driver.phone}
            onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={driver.is_active}
              onChange={(e) =>
                setDriver({ ...driver, is_active: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/drivers")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
