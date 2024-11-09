"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
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
      subtitle="Create a new penalty record for a driver"
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
      <div className="max-w-3xl mx-auto p-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-[#f3f2f1] rounded-lg h-16"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#edebe9] rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formFields.map((field) => (
                <div key={field.label} className="space-y-2">
                  <label className="text-sm font-semibold text-[#323130]">
                    {field.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <field.icon className="h-5 w-5 text-[#605e5c]" />
                    </div>
                    {field.type === "select" ? (
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="block w-full rounded-md border border-[#8a8886] pl-10 py-2 text-sm focus:border-[#0078d4] focus:ring-[#0078d4]"
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
                        className="block w-full rounded-md border border-[#8a8886] pl-10 py-2 text-sm focus:border-[#0078d4] focus:ring-[#0078d4]"
                        rows={4}
                        required={field.required}
                      />
                    ) : (
                      <div className="relative">
                        {field.prefix && (
                          <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                            <span className="text-gray-500">
                              {field.prefix}
                            </span>
                          </div>
                        )}
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`block w-full rounded-md border border-[#8a8886] ${
                            field.prefix ? "pl-14" : "pl-10"
                          } py-2 text-sm focus:border-[#0078d4] focus:ring-[#0078d4]`}
                          required={field.required}
                          step={field.type === "number" ? "0.01" : undefined}
                          min={field.type === "number" ? "0" : undefined}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t border-[#edebe9]">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/penalties")}
                    className="px-4 py-2 text-sm font-medium text-[#323130] bg-white border border-[#8a8886] rounded-md hover:bg-[#f3f2f1] focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0078d4] border border-transparent rounded-md hover:bg-[#106ebe] focus:outline-none focus:ring-2 focus:ring-[#0078d4] flex items-center gap-2"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    {submitting ? "Adding..." : "Add Penalty"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
