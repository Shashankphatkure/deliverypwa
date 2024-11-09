"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CustomerStats from "./components/CustomerStats";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    orderCount: "all", // all, none, active
    sortBy: "created_at",
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  async function fetchCustomers() {
    try {
      let query = supabase.from("users").select(`
          *,
          orders:orders(count)
        `);

      // Apply search filter
      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      // Apply order count filter
      if (filters.orderCount === "none") {
        query = query.eq("orders.count", 0);
      } else if (filters.orderCount === "active") {
        query = query.gt("orders.count", 0);
      }

      // Apply sorting
      query = query.order(filters.sortBy, { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
        <CustomerStats />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search customers..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={filters.orderCount}
            onChange={(e) =>
              setFilters({ ...filters, orderCount: e.target.value })
            }
            className="p-2 border rounded"
          >
            <option value="all">All Customers</option>
            <option value="active">With Orders</option>
            <option value="none">No Orders</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="created_at">Join Date</option>
            <option value="full_name">Name</option>
            <option value="email">Email</option>
          </select>
        </div>
        <a
          href="/dashboard/customers/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Customer
        </a>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4">{customer.full_name}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.phone || "N/A"}</td>
                  <td className="px-6 py-4">{customer.orders.length}</td>
                  <td className="px-6 py-4">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-x-2">
                      <a
                        href={`/dashboard/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </a>
                      <a
                        href={`/dashboard/customers/${customer.id}/orders`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Orders
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
