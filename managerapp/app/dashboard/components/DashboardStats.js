"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  UserGroupIcon,
  TruckIcon,
  ClockIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    activeDrivers: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    pendingPenalties: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchStats();
    const channel = supabase
      .channel("dashboard_stats")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchStats() {
    try {
      const [
        driversCount,
        ordersCount,
        customersCount,
        paymentsCount,
        revenueData,
        penaltiesCount,
      ] = await Promise.all([
        supabase
          .from("delivery_personnel")
          .select("*", { count: "exact" })
          .eq("is_active", true),
        supabase
          .from("orders")
          .select("*", { count: "exact" })
          .eq("status", "pending"),
        supabase.from("users").select("*", { count: "exact" }),
        supabase
          .from("driver_payments")
          .select("*", { count: "exact" })
          .eq("status", "pending"),
        supabase
          .from("orders")
          .select("total_amount")
          .eq("status", "delivered"),
        supabase
          .from("penalties")
          .select("*", { count: "exact" })
          .eq("status", "pending"),
      ]);

      const totalRevenue = revenueData.data?.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );

      setStats({
        activeDrivers: driversCount.count || 0,
        pendingOrders: ordersCount.count || 0,
        totalCustomers: customersCount.count || 0,
        pendingPayments: paymentsCount.count || 0,
        totalRevenue: totalRevenue || 0,
        pendingPenalties: penaltiesCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/50 rounded-xl h-32 backdrop-blur-lg"
          />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "ACTIVE DRIVERS",
      value: stats.activeDrivers,
      icon: TruckIcon,
      color: "blue",
    },
    {
      title: "PENDING ORDERS",
      value: stats.pendingOrders,
      icon: ClockIcon,
      color: "yellow",
    },
    {
      title: "TOTAL CUSTOMERS",
      value: stats.totalCustomers,
      icon: UserGroupIcon,
      color: "green",
    },
    {
      title: "PENDING PAYMENTS",
      value: stats.pendingPayments,
      icon: BanknotesIcon,
      color: "purple",
    },
    {
      title: "TOTAL REVENUE",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "emerald",
    },
    {
      title: "PENDING PENALTIES",
      value: stats.pendingPenalties,
      icon: ExclamationTriangleIcon,
      color: "red",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="dashboard-card group hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold mt-2 text-gray-800">
                {card.value}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg bg-${card.color}-50 group-hover:bg-${card.color}-100 transition-colors`}
            >
              <card.icon
                className={`w-6 h-6 text-${card.color}-600`}
                aria-hidden="true"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
