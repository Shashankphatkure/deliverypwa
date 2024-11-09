"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { use } from "react";

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!driver) return <div className="p-6">Driver not found</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Driver Assignments</h1>
          <p className="text-gray-600">
            Driver: {driver.full_name} ({driver.phone})
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/drivers")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Drivers
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">
                    Order #{assignment.orders.id.slice(0, 8)}
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(
                      assignment.orders.status
                    )}`}
                  >
                    {assignment.orders.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ${parseFloat(assignment.orders.total_amount).toFixed(2)}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Store:</span>{" "}
                  {assignment.orders.stores.name}
                </p>
                <p>
                  <span className="text-gray-600">Delivery to:</span>{" "}
                  {assignment.orders.delivery_address}
                </p>
                <p>
                  <span className="text-gray-600">Assigned:</span>{" "}
                  {new Date(assignment.created_at).toLocaleString()}
                </p>
                {assignment.pickup_time && (
                  <p>
                    <span className="text-gray-600">Picked up:</span>{" "}
                    {new Date(assignment.pickup_time).toLocaleString()}
                  </p>
                )}
                {assignment.delivery_time && (
                  <p>
                    <span className="text-gray-600">Delivered:</span>{" "}
                    {new Date(assignment.delivery_time).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <a
                  href={`/dashboard/orders/${assignment.orders.id}/view`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Order Details →
                </a>
              </div>
            </div>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No assignments found for this driver
          </div>
        )}
      </div>
    </div>
  );
}
