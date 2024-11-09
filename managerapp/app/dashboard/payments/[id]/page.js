"use client";
import { useState, useEffect, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import {
  BanknotesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function PaymentDetailsPage({ params }) {
  const router = useRouter();
  const paymentId = use(params).id;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  async function fetchPaymentDetails() {
    try {
      const { data, error } = await supabase
        .from("driver_payments")
        .select(
          `
          *,
          delivery_personnel:delivery_personnel(full_name, email, phone)
        `
        )
        .eq("id", paymentId)
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus) {
    try {
      const { error } = await supabase
        .from("driver_payments")
        .update({ paymentstatus: newStatus })
        .eq("id", paymentId);

      if (error) throw error;

      // Refresh payment details
      fetchPaymentDetails();

      // Send notification
      await supabase.from("notifications").insert([
        {
          recipient_type: "driver",
          recipient_id: payment.driverid,
          title: "Payment Status Updated",
          message: `Your payment status has been updated to ${newStatus}`,
          type: "payment",
        },
      ]);
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Error updating payment status. Please try again.");
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Payment Details">
        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-[#f3f2f1] rounded-lg h-16"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Payment Details"
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
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Driver Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Driver Information
            </h2>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-gray-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {payment.delivery_personnel?.full_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {payment.delivery_personnel?.email}
                </p>
                <p className="text-sm text-gray-500">
                  {payment.delivery_personnel?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Final Amount
                </label>
                <div className="mt-1 flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg font-semibold">
                    ${payment.finalamount}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Orders
                </label>
                <div className="mt-1 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg">{payment.totalorders}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Distance
                </label>
                <div className="mt-1 flex items-center">
                  <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg">{payment.totalkm} km</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Advance
                </label>
                <div className="mt-1 flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg">${payment.advance || 0}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Penalty
                </label>
                <div className="mt-1 flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-lg text-red-600">
                    ${payment.penalty || 0}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <div className="mt-1 flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Payment Status
                </h3>
                <span
                  className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    payment.paymentstatus === "completed"
                      ? "bg-green-100 text-green-800"
                      : payment.paymentstatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {payment.paymentstatus}
                </span>
              </div>
              <div className="flex gap-2">
                {payment.paymentstatus !== "completed" && (
                  <button
                    onClick={() => handleStatusUpdate("completed")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Mark as Completed
                  </button>
                )}
                {payment.paymentstatus !== "failed" && (
                  <button
                    onClick={() => handleStatusUpdate("failed")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Mark as Failed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
