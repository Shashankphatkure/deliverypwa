"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("name");

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStoreStatus(storeId, currentStatus) {
    try {
      const { error } = await supabase
        .from("stores")
        .update({ is_active: !currentStatus })
        .eq("id", storeId);

      if (error) throw error;
      fetchStores(); // Refresh the list
    } catch (error) {
      console.error("Error updating store status:", error);
      alert("Error updating store status");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stores</h1>
        <Link
          href="/dashboard/stores/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Store
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Store Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{store.name}</p>
                    {store.description && (
                      <p className="text-sm text-gray-500">
                        {store.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">{store.address}</td>
                <td className="px-6 py-4">{store.phone}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      store.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {store.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {store.opening_time && store.closing_time
                    ? `${store.opening_time} - ${store.closing_time}`
                    : "Not set"}
                </td>
                <td className="px-6 py-4">
                  <div className="space-x-2">
                    <Link
                      href={`/dashboard/stores/${store.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        toggleStoreStatus(store.id, store.is_active)
                      }
                      className={`${
                        store.is_active
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {store.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stores.length === 0 && (
          <div className="text-center py-8 text-gray-500">No stores found</div>
        )}
      </div>
    </div>
  );
}
