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
  ShoppingBagIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

export default function NewPenaltyPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [predefinedReasons, setPredefinedReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [penalty, setPenalty] = useState({
    driver_id: "",
    order_id: "",
    amount: "",
    reason_type: "predefined",
    predefined_reason_id: "",
    reason: "",
    evidence_url: "",
    resolution_notes: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      // Fetch drivers
      const { data: driversData } = await supabase
        .from("delivery_personnel")
        .select("id, full_name")
        .eq("is_active", true);

      // Fetch predefined reasons
      const { data: reasonsData } = await supabase
        .from("penalty_reasons")
        .select("*")
        .eq("is_active", true);

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, created_at, status")
        .order("created_at", { ascending: false })
        .limit(50);

      setDrivers(driversData || []);
      setPredefinedReasons(reasonsData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Handle predefined reason selection
  useEffect(() => {
    if (penalty.predefined_reason_id && penalty.reason_type === "predefined") {
      const selectedReason = predefinedReasons.find(
        (r) => r.id === penalty.predefined_reason_id
      );
      if (selectedReason) {
        setPenalty((prev) => ({
          ...prev,
          amount: selectedReason.default_amount,
          reason: selectedReason.reason,
        }));
      }
    }
  }, [penalty.predefined_reason_id, penalty.reason_type]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error: penaltyError } = await supabase.from("penalties").insert([
        {
          driver_id: penalty.driver_id,
          order_id: penalty.order_id || null,
          amount: penalty.amount,
          reason_type: penalty.reason_type,
          predefined_reason_id:
            penalty.reason_type === "predefined"
              ? penalty.predefined_reason_id
              : null,
          reason: penalty.reason,
          evidence_url: penalty.evidence_url,
          resolution_notes: penalty.resolution_notes,
          status: "pending",
        },
      ]);

      if (penaltyError) throw penaltyError;

      // Send notification to driver
      await supabase.from("notifications").insert([
        {
          recipient_type: "driver",
          recipient_id: penalty.driver_id,
          title: "New Penalty Added",
          message: `A penalty of $${penalty.amount} has been added to your account. Reason: ${penalty.reason}`,
          type: "penalty",
        },
      ]);

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
      label: "Related Order",
      type: "select",
      value: penalty.order_id,
      onChange: (value) => setPenalty({ ...penalty, order_id: value }),
      icon: ShoppingBagIcon,
      options: orders.map((order) => ({
        value: order.id,
        label: `Order #${order.id} - ${new Date(
          order.created_at
        ).toLocaleDateString()}`,
      })),
    },
    {
      label: "Reason Type",
      type: "select",
      value: penalty.reason_type,
      onChange: (value) =>
        setPenalty({ ...penalty, reason_type: value, reason: "" }),
      icon: ListBulletIcon,
      options: [
        { value: "predefined", label: "Predefined Reason" },
        { value: "custom", label: "Custom Reason" },
      ],
      required: true,
    },
    ...(penalty.reason_type === "predefined"
      ? [
          {
            label: "Select Reason",
            type: "select",
            value: penalty.predefined_reason_id,
            onChange: (value) =>
              setPenalty({ ...penalty, predefined_reason_id: value }),
            icon: DocumentTextIcon,
            options: predefinedReasons.map((reason) => ({
              value: reason.id,
              label: `${reason.reason} ($${reason.default_amount})`,
            })),
            required: true,
          },
        ]
      : [
          {
            label: "Custom Reason",
            type: "textarea",
            value: penalty.reason,
            onChange: (value) => setPenalty({ ...penalty, reason: value }),
            icon: DocumentTextIcon,
            required: true,
          },
        ]),
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
      label: "Evidence URL",
      type: "url",
      value: penalty.evidence_url,
      onChange: (value) => setPenalty({ ...penalty, evidence_url: value }),
      icon: DocumentTextIcon,
    },
    {
      label: "Resolution Notes",
      type: "textarea",
      value: penalty.resolution_notes,
      onChange: (value) => setPenalty({ ...penalty, resolution_notes: value }),
      icon: DocumentTextIcon,
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
