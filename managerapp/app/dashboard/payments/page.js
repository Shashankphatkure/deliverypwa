"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const { data, error } = await supabase
        .from("driver_payments")
        .select(
          `
          *,
          delivery_personnel:delivery_personnel(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }

  const paymentStats = [
    {
      title: "Total Payments",
      value: `$${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`,
      icon: BanknotesIcon,
      color: "blue",
    },
    {
      title: "Pending Payments",
      value: payments.filter((p) => p.status === "pending").length,
      icon: ClockIcon,
      color: "yellow",
    },
    {
      title: "Completed Payments",
      value: payments.filter((p) => p.status === "completed").length,
      icon: CheckCircleIcon,
      color: "green",
    },
    {
      title: "Failed Payments",
      value: payments.filter((p) => p.status === "failed").length,
      icon: XCircleIcon,
      color: "red",
    },
  ];

  return (
    <DashboardLayout
      title="Driver Payments"
      actions={
        <Link
          href="/dashboard/payments/new"
          className="dashboard-button-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Process New Payment
        </Link>
      }
    >
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {paymentStats.map((stat) => (
            <div key={stat.title} className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#605e5c]">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search payments..."
              className="dashboard-input pl-10 w-full"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <select className="dashboard-input">
            <option value="all">All Types</option>
            <option value="salary">Salary</option>
            <option value="bonus">Bonus</option>
            <option value="penalty">Penalty</option>
          </select>
          <select className="dashboard-input">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="h-12 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserGroupIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.delivery_personnel.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.payment_type === "salary"
                            ? "bg-blue-100 text-blue-800"
                            : payment.payment_type === "bonus"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {payments.length === 0 && !loading && (
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No payments found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by processing a new payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
