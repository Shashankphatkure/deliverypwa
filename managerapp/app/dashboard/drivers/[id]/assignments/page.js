"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { use } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  TruckIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export default function DriverAssignmentsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClientComponentClient();
  const [driver, setDriver] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverAndAssignments();
  }, []);

  async function fetchDriverAndAssignments() {
    try {
      // Fetch driver details
      const { data: driverData, error: driverError } = await supabase
        .from("delivery_personnel")
        .select("*")
        .eq("id", id)
        .single();

      if (driverError) throw driverError;
      setDriver(driverData);

      // Fetch all assignments for this driver
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("delivery_assignments")
        .select(
          `
          *,
          orders (
            id,
            status,
            total_amount,
            delivery_address,
            created_at,
            stores (name)
          )
        `
        )
        .eq("delivery_personnel_id", id)
        .order("created_at", { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching driver assignments");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      picked_up: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout
      title="Driver Assignments"
      subtitle={
        driver
          ? `${driver.full_name} (${driver.phone})`
          : "Loading driver details..."
      }
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
        className="p-6"
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/50 rounded-xl h-48 backdrop-blur-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="dashboard-card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">
                      Order #{assignment.orders.id.slice(0, 8)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      assignment.orders.status
                    )}`}
                  >
                    {assignment.orders.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{assignment.orders.stores.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="text-gray-600">
                      {assignment.orders.delivery_address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(assignment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`/dashboard/orders/${assignment.orders.id}/view`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View Details
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}

            {assignments.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No assignments found for this driver
              </div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
