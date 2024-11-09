"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function AssignOrderPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClientComponentClient();
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

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
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setAssigning(true);

    try {
      // Create delivery assignment
      const { error: assignmentError } = await supabase
        .from("delivery_assignments")
        .insert([
          {
            order_id: id,
            delivery_personnel_id: selectedDriver,
            status: "assigned",
          },
        ]);

      if (assignmentError) throw assignmentError;

      // Create notification for driver
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            recipient_type: "driver",
            recipient_id: selectedDriver,
            title: "New Order Assigned",
            message: `Order #${id} has been assigned to you`,
            type: "order",
          },
        ]);

      if (notificationError) throw notificationError;

      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Error assigning order. Please try again.");
    } finally {
      setAssigning(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Assign Order #{id.slice(0, 8)}
      </h1>

      <form onSubmit={handleAssign} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Select Driver
          </label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Choose a driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={assigning}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {assigning ? "Assigning..." : "Assign Order"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/orders")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
