"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function NewPaymentPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState({
    driver_id: "",
    amount: "",
    payment_type: "salary",
    description: "",
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
    setProcessing(true);

    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from("driver_payments")
        .insert([
          {
            ...payment,
            status: "pending",
            payment_date: new Date().toISOString(),
          },
        ]);

      if (paymentError) throw paymentError;

      // Create notification for driver
      await supabase.from("notifications").insert([
        {
          recipient_type: "driver",
          recipient_id: payment.driver_id,
          title: "New Payment Processed",
          message: `A ${payment.payment_type} payment of $${payment.amount} has been processed`,
          type: "payment",
        },
      ]);

      router.push("/dashboard/payments");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Process New Payment</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Driver</label>
          <select
            value={payment.driver_id}
            onChange={(e) =>
              setPayment({ ...payment, driver_id: e.target.value })
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
            value={payment.amount}
            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Payment Type</label>
          <select
            value={payment.payment_type}
            onChange={(e) =>
              setPayment({ ...payment, payment_type: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="salary">Salary</option>
            <option value="bonus">Bonus</option>
            <option value="penalty">Penalty</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={payment.description}
            onChange={(e) =>
              setPayment({ ...payment, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={processing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {processing ? "Processing..." : "Process Payment"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/payments")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
