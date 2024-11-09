"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  PhotoIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function NewStorePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [submitting, setSubmitting] = useState(false);
  const [store, setStore] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    opening_time: "",
    closing_time: "",
    image_url: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("stores").insert([
        {
          ...store,
          is_active: true,
        },
      ]);

      if (error) throw error;
      router.push("/dashboard/stores");
    } catch (error) {
      console.error("Error creating store:", error);
      alert("Error creating store. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const formFields = [
    {
      label: "Store Name",
      type: "text",
      value: store.name,
      onChange: (value) => setStore({ ...store, name: value }),
      icon: BuildingStorefrontIcon,
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      value: store.description,
      onChange: (value) => setStore({ ...store, description: value }),
      icon: DocumentTextIcon,
    },
    {
      label: "Address",
      type: "textarea",
      value: store.address,
      onChange: (value) => setStore({ ...store, address: value }),
      icon: MapPinIcon,
      required: true,
    },
    {
      label: "Phone",
      type: "tel",
      value: store.phone,
      onChange: (value) => setStore({ ...store, phone: value }),
      icon: PhoneIcon,
    },
    {
      label: "Opening Time",
      type: "time",
      value: store.opening_time,
      onChange: (value) => setStore({ ...store, opening_time: value }),
      icon: ClockIcon,
    },
    {
      label: "Closing Time",
      type: "time",
      value: store.closing_time,
      onChange: (value) => setStore({ ...store, closing_time: value }),
      icon: ClockIcon,
    },
    {
      label: "Image URL",
      type: "url",
      value: store.image_url,
      onChange: (value) => setStore({ ...store, image_url: value }),
      icon: PhotoIcon,
      placeholder: "https://...",
    },
  ];

  return (
    <DashboardLayout
      title="Add New Store"
      actions={
        <button
          onClick={() => router.push("/dashboard/stores")}
          className="dashboard-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Stores
        </button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
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
                {field.type === "textarea" ? (
                  <textarea
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="dashboard-input pl-10"
                    rows={3}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="dashboard-input pl-10"
                    required={field.required}
                    placeholder={field.placeholder}
                  />
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
              <BuildingStorefrontIcon className="w-5 h-5" />
              {submitting ? "Adding..." : "Add Store"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
