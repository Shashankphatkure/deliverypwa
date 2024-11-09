"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

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
          driver:delivery_personnel(full_name)
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Penalties</h1>
        <Link
          href="/dashboard/penalties/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Penalty
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {penalties.map((penalty) => (
              <tr key={penalty.id}>
                <td className="px-6 py-4">{penalty.driver?.full_name}</td>
                <td className="px-6 py-4">${penalty.amount}</td>
                <td className="px-6 py-4">{penalty.reason}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      penalty.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : penalty.status === "processed"
                        ? "bg-green-100 text-green-800"
                        : penalty.status === "disputed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {penalty.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(penalty.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
