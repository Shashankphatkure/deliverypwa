"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function TransferOrderPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClientComponentClient();
  const [drivers, setDrivers] = useState([]);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetchOrderAndDrivers();
  }, []);

  async function fetchOrderAndDrivers() {
    try {
      // Fetch current assignment
      const { data: assignment } = await supabase
        .from("delivery_assignments")
        .select("delivery_personnel_id")
        .eq("order_id", id)
        .single();

      if (assignment) {
        setCurrentDriver(assignment.delivery_personnel_id);
      }

      // Fetch available drivers
      const { data: availableDrivers } = await supabase
        .from("delivery_personnel")
        .select("id, full_name")
        .eq("is_active", true);

      setDrivers(availableDrivers || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setTransferring(true);

    try {
      // Create transfer record
      const { error: transferError } = await supabase
        .from("order_transfers")
        .insert([
          {
            order_id: id,
            from_driver_id: currentDriver,
            to_driver_id: selectedDriver,
            reason,
            transferred_by: "current_manager_id", // Replace with actual manager ID
          },
        ]);

      if (transferError) throw transferError;

      // Update delivery assignment
      const { error: assignmentError } = await supabase
        .from("delivery_assignments")
        .update({ delivery_personnel_id: selectedDriver })
        .eq("order_id", id);

      if (assignmentError) throw assignmentError;

      // Create notifications for both drivers
      await Promise.all([
        supabase.from("notifications").insert([
          {
            recipient_type: "driver",
            recipient_id: currentDriver,
            title: "Order Transferred",
            message: `Order #${id} has been reassigned to another driver`,
            type: "order",
          },
          {
            recipient_type: "driver",
            recipient_id: selectedDriver,
            title: "New Order Assigned",
            message: `Order #${id} has been assigned to you`,
            type: "order",
          },
        ]),
      ]);

      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error transferring order:", error);
      alert("Error transferring order. Please try again.");
    } finally {
      setTransferring(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transfer Order #{id}</h1>

      <form onSubmit={handleTransfer} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">New Driver</label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Driver</option>
            {drivers
              .filter((driver) => driver.id !== currentDriver)
              .map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Transfer Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded"
            required
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={transferring}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {transferring ? "Transferring..." : "Transfer Order"}
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
