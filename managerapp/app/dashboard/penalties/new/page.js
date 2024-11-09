"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function NewPenaltyPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [penalty, setPenalty] = useState({
    driver_id: "",
    amount: "",
    reason: "",
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    try {
      const { data, error } = await supabase
        .from("delivery_personnel")
        .select("id, full_name")
        .eq("is_active", true);

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create penalty record without manager authentication
      const { error: penaltyError } = await supabase.from("penalties").insert([
        {
          driver_id: penalty.driver_id,
          amount: penalty.amount,
          reason: penalty.reason,
          status: "pending",
          // Removing the created_by field since we're not tracking the manager
        },
      ]);

      if (penaltyError) throw penaltyError;

      // Create notification for driver
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            recipient_type: "driver",
            recipient_id: penalty.driver_id,
            title: "New Penalty Added",
            message: `A penalty of $${penalty.amount} has been added to your account. Reason: ${penalty.reason}`,
            type: "penalty",
          },
        ]);

      if (notificationError) throw notificationError;

      router.push("/dashboard/penalties");
    } catch (error) {
      console.error("Error creating penalty:", error);
      alert("Error creating penalty. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Penalty</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Driver</label>
          <select
            value={penalty.driver_id}
            onChange={(e) =>
              setPenalty({ ...penalty, driver_id: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={penalty.amount}
            onChange={(e) => setPenalty({ ...penalty, amount: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            value={penalty.reason}
            onChange={(e) => setPenalty({ ...penalty, reason: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {submitting ? "Adding..." : "Add Penalty"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/penalties")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
