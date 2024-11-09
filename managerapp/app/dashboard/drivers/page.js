"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import {
  UserGroupIcon,
  PlusIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    try {
      const { data, error } = await supabase
        .from("delivery_personnel")
        .select(
          `
          *,
          delivery_assignments!inner (
            id,
            status,
            orders (
              id,
              status,
              stores (name),
              delivery_address
            )
          )
        `
        )
        .eq("delivery_assignments.status", "assigned")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout
      title="Delivery Drivers"
      actions={
        <a
          href="/dashboard/drivers/new"
          className="dashboard-button-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Driver
        </a>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/50 rounded-xl h-24 backdrop-blur-lg"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Assignments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{driver.full_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>Email: {driver.email}</div>
                        <div>Phone: {driver.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          driver.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {driver.delivery_assignments?.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="text-sm bg-gray-50 p-2 rounded"
                          >
                            <div className="font-medium">
                              Order #{assignment.orders.id.slice(0, 8)}
                            </div>
                            <div className="text-gray-600">
                              Store: {assignment.orders.stores.name}
                            </div>
                            <div className="text-gray-600 truncate max-w-xs">
                              To: {assignment.orders.delivery_address}
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(
                                assignment.orders.status
                              )}`}
                            >
                              {assignment.orders.status}
                            </span>
                          </div>
                        ))}
                        {(!driver.delivery_assignments ||
                          driver.delivery_assignments.length === 0) && (
                          <span className="text-gray-500 text-sm">
                            No current assignments
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <a
                          href={`/dashboard/drivers/${driver.id}`}
                          className="text-blue-600 hover:text-blue-900 block"
                        >
                          Edit
                        </a>
                        <a
                          href={`/dashboard/drivers/${driver.id}/assignments`}
                          className="text-green-600 hover:text-green-900 block"
                        >
                          View All Assignments
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {drivers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No drivers found
              </div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

function getStatusColor(status) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    picked_up: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
