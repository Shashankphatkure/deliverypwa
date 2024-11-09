"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPenalties: 0,
    pendingAmount: 0,
    processedAmount: 0,
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPenalties();
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const { data } = await supabase
        .from("penalties")
        .select("amount, status");

      const totalPenalties = data?.length || 0;
      const pendingAmount =
        data
          ?.filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + p.amount, 0) || 0;
      const processedAmount =
        data
          ?.filter((p) => p.status === "processed")
          .reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({ totalPenalties, pendingAmount, processedAmount });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function fetchPenalties() {
    try {
      const { data, error } = await supabase
        .from("penalties")
        .select(
          `
          *,
          driver:delivery_personnel(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPenalties(data || []);
    } catch (error) {
      console.error("Error fetching penalties:", error);
    } finally {
      setLoading(false);
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout
      title="Penalties"
      actions={
        <Link
          href="/dashboard/penalties/new"
          className="dashboard-button-primary flex items-center gap-2"
        >
          <ExclamationTriangleIcon className="w-5 h-5" />
          Add New Penalty
        </Link>
      }
    >
      <div className="p-6">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  TOTAL PENALTIES
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalPenalties}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  PENDING AMOUNT
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${stats.pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  PROCESSED AMOUNT
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${stats.processedAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Penalties List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {loading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white/50 rounded-xl h-24 backdrop-blur-lg"
                />
              ))
            : penalties.map((penalty) => (
                <motion.div
                  key={penalty.id}
                  variants={item}
                  className="dashboard-card group hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {penalty.driver?.full_name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            penalty.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : penalty.status === "processed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {penalty.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{penalty.reason}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(penalty.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-gray-800">
                        ${penalty.amount}
                      </div>
                      {penalty.status === "pending" && (
                        <button className="text-blue-600 hover:text-blue-800">
                          Process
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

          {penalties.length === 0 && !loading && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No penalties
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new penalty.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
