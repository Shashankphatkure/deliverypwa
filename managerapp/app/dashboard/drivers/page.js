"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched drivers:", data);
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
      subtitle={`Total Drivers: ${drivers.length}`}
      actions={
        <Link
          href="/dashboard/drivers/new"
          className="dashboard-button-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Driver
        </Link>
      }
    >
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl h-24" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {driver.photo ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={driver.photo}
                              alt={driver.full_name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserGroupIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {driver.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {driver.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.phone}
                      </div>
                      <div className="text-sm text-gray-500">{driver.city}</div>
                    </td>
                    <td className="px-6 py-4">
                      {driver.vehicle_type && (
                        <div className="text-sm text-gray-900">
                          {driver.vehicle_type}
                        </div>
                      )}
                      {driver.vehicle_number && (
                        <div className="text-sm text-gray-500">
                          {driver.vehicle_number}
                        </div>
                      )}
                      {driver.vehicle_color && (
                        <div className="text-sm text-gray-500">
                          {driver.vehicle_color}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.is_active ? "Active" : "Inactive"}
                      </span>
                      {driver.driver_mode && (
                        <span
                          className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driver.driver_mode === "online"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {driver.driver_mode}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="space-y-2">
                        <Link
                          href={`/dashboard/drivers/${driver.id}`}
                          className="text-blue-600 hover:text-blue-900 block"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/drivers/${driver.id}/assignments`}
                          className="text-green-600 hover:text-green-900 block"
                        >
                          View Assignments
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {drivers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No drivers found. Add your first driver to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
