"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import {
  BanknotesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CalculatorIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function NewPaymentPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState({
    driverid: "",
    finalamount: "",
    totalkm: "",
    totalorders: "",
    advance: "",
    penalty: "",
    paymentstatus: "pending",
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    try {
      const { data, error } = await supabase
        .from("delivery_personnel")
        .select("email, full_name, phone")
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
            finalamount: Number(payment.finalamount),
            totalorders: Number(payment.totalorders),
            advance: Number(payment.advance) || 0,
            penalty: Number(payment.penalty) || 0,
          },
        ]);

      if (paymentError) throw paymentError;

      await supabase.from("notifications").insert([
        {
          recipient_type: "driver",
          recipient_id: payment.driverid,
          title: "New Payment Processed",
          message: `A payment of $${payment.finalamount} has been processed`,
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
      value: payment.driverid,
      onChange: (value) => setPayment({ ...payment, driverid: value }),
      icon: UserGroupIcon,
      options: drivers.map((driver) => ({
        value: driver.email,
        label: `${driver.full_name} (${driver.phone})`,
      })),
      required: true,
    },
    {
      label: "Final Amount",
      type: "number",
      value: payment.finalamount,
      onChange: (value) => setPayment({ ...payment, finalamount: value }),
      icon: CalculatorIcon,
      prefix: "$",
      required: true,
    },
    {
      label: "Total KM",
      type: "text",
      value: payment.totalkm,
      onChange: (value) => setPayment({ ...payment, totalkm: value }),
      icon: TruckIcon,
      required: true,
    },
    {
      label: "Total Orders",
      type: "number",
      value: payment.totalorders,
      onChange: (value) => setPayment({ ...payment, totalorders: value }),
      icon: DocumentTextIcon,
      required: true,
    },
    {
      label: "Advance",
      type: "number",
      value: payment.advance,
      onChange: (value) => setPayment({ ...payment, advance: value }),
      icon: BanknotesIcon,
    },
    {
      label: "Penalty",
      type: "number",
      value: payment.penalty,
      onChange: (value) => setPayment({ ...payment, penalty: value }),
      icon: XCircleIcon,
    },
  ];

  return (
    <DashboardLayout
      title="Process New Payment"
      subtitle="Create a new payment record for a driver"
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
      <div className="max-w-3xl mx-auto p-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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
                    onClick={() => router.push("/dashboard/payments")}
                    className="px-4 py-2 text-sm font-medium text-[#323130] bg-white border border-[#8a8886] rounded-md hover:bg-[#f3f2f1] focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0078d4] border border-transparent rounded-md hover:bg-[#106ebe] focus:outline-none focus:ring-2 focus:ring-[#0078d4] flex items-center gap-2"
                  >
                    <BanknotesIcon className="w-5 h-5" />
                    {processing ? "Processing..." : "Process Payment"}
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
