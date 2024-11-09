"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPenalties();
  }, []);

  async function fetchPenalties() {
    try {
      const { data, error } = await supabase
        .from("penalties")
        .select(
          `
          *,
          delivery_personnel:delivery_personnel(full_name),
          manager:managers(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPenalties(data || []);
    } catch (error) {
      console.error("Error fetching penalties:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(penaltyId, newStatus) {
    try {
      const { error } = await supabase
        .from("penalties")
        .update({ status: newStatus })
        .eq("id", penaltyId);

      if (error) throw error;

      setPenalties(
        penalties.map((penalty) =>
          penalty.id === penaltyId ? { ...penalty, status: newStatus } : penalty
        )
      );
    } catch (error) {
      console.error("Error updating penalty status:", error);
      alert("Error updating penalty status. Please try again.");
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Penalties</h1>
        <a
          href="/dashboard/penalties/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Penalty
        </a>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {penalties.map((penalty) => (
                <tr key={penalty.id}>
                  <td className="px-6 py-4">
                    {penalty.delivery_personnel.full_name}
                  </td>
                  <td className="px-6 py-4">${penalty.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{penalty.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        penalty.status === "processed"
                          ? "bg-green-100 text-green-800"
                          : penalty.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : penalty.status === "disputed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {penalty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{penalty.manager.full_name}</td>
                  <td className="px-6 py-4">
                    {new Date(penalty.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {penalty.status === "pending" && (
                      <div className="space-x-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(penalty.id, "processed")
                          }
                          className="text-green-600 hover:text-green-900"
                        >
                          Process
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(penalty.id, "cancelled")
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
