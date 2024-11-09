"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

  if (loading) return <div>Loading statistics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {key
              .replace(/([A-Z])/g, " $1")
              .trim()
              .toUpperCase()}
          </h3>
          <p className="text-3xl font-bold">
            {key === "totalRevenue" ? `$${value.toFixed(2)}` : value}
          </p>
        </div>
      ))}
    </div>
  );
}
