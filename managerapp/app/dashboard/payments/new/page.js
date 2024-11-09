"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  BanknotesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

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
        .select("id, full_name, phone")
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

  const formFields = [
    {
      label: "Driver",
      type: "select",
      value: payment.driver_id,
      onChange: (value) => setPayment({ ...payment, driver_id: value }),
      icon: UserGroupIcon,
      options: drivers.map((driver) => ({
        value: driver.id,
        label: `${driver.full_name} (${driver.phone})`,
      })),
      required: true,
    },
    {
      label: "Amount",
      type: "number",
      value: payment.amount,
      onChange: (value) => setPayment({ ...payment, amount: value }),
      icon: CalculatorIcon,
      prefix: "$",
      required: true,
    },
    {
      label: "Payment Type",
      type: "select",
      value: payment.payment_type,
      onChange: (value) => setPayment({ ...payment, payment_type: value }),
      icon: BanknotesIcon,
      options: [
        { value: "salary", label: "Salary" },
        { value: "bonus", label: "Bonus" },
        { value: "penalty", label: "Penalty" },
      ],
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      value: payment.description,
      onChange: (value) => setPayment({ ...payment, description: value }),
      icon: DocumentTextIcon,
      required: true,
    },
  ];

  return (
    <DashboardLayout
      title="Process New Payment"
      actions={
        <button
          onClick={() => router.push("/dashboard/payments")}
          className="dashboard-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Payments
        </button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/50 rounded-xl h-16 backdrop-blur-lg"
              />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formFields.map((field) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="dashboard-card"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <field.icon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  {field.type === "select" ? (
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="dashboard-input pl-10"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="dashboard-input pl-10"
                      rows={4}
                      required={field.required}
                    />
                  ) : (
                    <div className="relative">
                      {field.prefix && (
                        <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                          <span className="text-gray-500">{field.prefix}</span>
                        </div>
                      )}
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className={`dashboard-input ${
                          field.prefix ? "pl-14" : "pl-10"
                        }`}
                        required={field.required}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end space-x-4"
            >
              <button
                type="submit"
                disabled={processing}
                className="dashboard-button-primary flex items-center gap-2"
              >
                <BanknotesIcon className="w-5 h-5" />
                {processing ? "Processing..." : "Process Payment"}
              </button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
