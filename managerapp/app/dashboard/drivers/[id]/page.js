"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function DriverDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const supabase = createClientComponentClient();
  const [driver, setDriver] = useState({
    full_name: "",
    email: "",
    phone: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id !== "new") {
      fetchDriver();
    } else {
      setLoading(false);
    }
  }, [id]);

  async function fetchDriver() {
    try {
      const { data, error } = await supabase
        .from("delivery_personnel")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) setDriver(data);
    } catch (error) {
      console.error("Error fetching driver:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      if (id === "new") {
        const { error } = await supabase
          .from("delivery_personnel")
          .insert([driver]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("delivery_personnel")
          .update(driver)
          .eq("id", id);
        if (error) throw error;
      }

      router.push("/dashboard/drivers");
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Error saving driver. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const formFields = [
    {
      label: "Full Name",
      type: "text",
      value: driver.full_name,
      onChange: (value) => setDriver({ ...driver, full_name: value }),
      icon: UserIcon,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      value: driver.email,
      onChange: (value) => setDriver({ ...driver, email: value }),
      icon: EnvelopeIcon,
      required: true,
    },
    {
      label: "Phone",
      type: "tel",
      value: driver.phone,
      onChange: (value) => setDriver({ ...driver, phone: value }),
      icon: PhoneIcon,
      required: true,
    },
  ];

  return (
    <DashboardLayout
      title={id === "new" ? "Add New Driver" : "Edit Driver"}
      actions={
        <button
          onClick={() => router.push("/dashboard/drivers")}
          className="dashboard-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Drivers
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
                      className="h-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="dashboard-input pl-10"
                    required={field.required}
                  />
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="dashboard-card"
            >
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={driver.is_active}
                  onChange={(e) =>
                    setDriver({ ...driver, is_active: e.target.checked })
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Status
                </span>
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end space-x-4"
            >
              <button
                type="submit"
                disabled={saving}
                className="dashboard-button-primary flex items-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                {saving ? "Saving..." : "Save Driver"}
              </button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
