"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

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
      const { error: penaltyError } = await supabase.from("penalties").insert([
        {
          driver_id: penalty.driver_id,
          amount: penalty.amount,
          reason: penalty.reason,
          status: "pending",
        },
      ]);

      if (penaltyError) throw penaltyError;

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

  const formFields = [
    {
      label: "Driver",
      type: "select",
      value: penalty.driver_id,
      onChange: (value) => setPenalty({ ...penalty, driver_id: value }),
      icon: UserGroupIcon,
      options: drivers.map((driver) => ({
        value: driver.id,
        label: driver.full_name,
      })),
      required: true,
    },
    {
      label: "Amount",
      type: "number",
      value: penalty.amount,
      onChange: (value) => setPenalty({ ...penalty, amount: value }),
      icon: CurrencyDollarIcon,
      prefix: "$",
      required: true,
    },
    {
      label: "Reason",
      type: "textarea",
      value: penalty.reason,
      onChange: (value) => setPenalty({ ...penalty, reason: value }),
      icon: DocumentTextIcon,
      required: true,
    },
  ];

  return (
    <DashboardLayout
      title="Add New Penalty"
      actions={
        <button
          onClick={() => router.push("/dashboard/penalties")}
          className="dashboard-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Penalties
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
            {[...Array(3)].map((_, i) => (
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
                      <option value="">Select Driver</option>
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
                disabled={submitting}
                className="dashboard-button-primary flex items-center gap-2"
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                {submitting ? "Adding..." : "Add Penalty"}
              </button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
