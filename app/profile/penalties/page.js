"use client";
import { useState } from "react";

export default function Penalties() {
  const [activeTab, setActiveTab] = useState("active");
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [appealReason, setAppealReason] = useState("");

  const handleAppeal = (penalty) => {
    setSelectedPenalty(penalty);
    setShowAppealModal(true);
  };

  const submitAppeal = () => {
    // Handle appeal submission logic here
    console.log({ penaltyId: selectedPenalty.id, appealReason });
    setShowAppealModal(false);
    setAppealReason("");
  };

  const penalties = {
    active: [
      {
        id: 1,
        type: "Late Delivery",
        amount: "₹100",
        date: "Today, 2:30 PM",
        order: "#1234",
        status: "Active",
        description: "Delivery exceeded estimated time by 25 minutes",
        canAppeal: true,
        severity: "medium",
      },
      {
        id: 2,
        type: "Order Cancellation",
        amount: "₹150",
        date: "Yesterday",
        order: "#1235",
        status: "Under Review",
        description: "Order cancelled without valid reason",
        canAppeal: true,
        severity: "high",
      },
    ],
    resolved: [
      {
        id: 3,
        type: "Improper Delivery",
        amount: "₹50",
        date: "15 March, 2024",
        order: "#1230",
        status: "Resolved",
        description: "Food items damaged during delivery",
        resolution: "Penalty reduced after review",
        severity: "low",
      },
      {
        id: 4,
        type: "Late Delivery",
        amount: "₹75",
        date: "14 March, 2024",
        order: "#1229",
        status: "Appealed Successfully",
        description: "Delivery delayed due to traffic",
        resolution: "Penalty waived off due to valid reason",
        severity: "medium",
      },
    ],
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Penalties</h1>

      {/* Penalties Summary */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Total Penalties</p>
            <p className="text-2xl font-bold">₹375.00</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Active Penalties</p>
            <p className="text-2xl font-bold">2</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Resolved</p>
            <p className="text-2xl font-bold">2</p>
          </div>
        </div>
      </div>

      {/* Penalty Guidelines */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Penalties can be appealed within 48 hours of issuance. Multiple
              violations may result in account suspension.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "active"
              ? "bg-white font-medium shadow"
              : "text-gray-600"
          }`}
        >
          Active Penalties
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "resolved"
              ? "bg-white font-medium shadow"
              : "text-gray-600"
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Penalties List */}
      <div className="space-y-4">
        {penalties[activeTab].map((penalty) => (
          <div key={penalty.id} className="bg-white rounded-lg shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                      penalty.severity
                    )}`}
                  >
                    {penalty.type}
                  </span>
                  <h3 className="font-medium mt-2">Order {penalty.order}</h3>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {penalty.amount}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {penalty.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{penalty.date}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    penalty.status === "Active"
                      ? "bg-red-100 text-red-800"
                      : penalty.status === "Under Review"
                      ? "bg-blue-100 text-blue-800"
                      : penalty.status === "Resolved"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {penalty.status}
                </span>
              </div>

              {penalty.resolution && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Resolution: </span>
                  {penalty.resolution}
                </div>
              )}

              {penalty.canAppeal && (
                <button
                  onClick={() => handleAppeal(penalty)}
                  className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg text-sm"
                >
                  Appeal Penalty
                </button>
              )}
            </div>
          </div>
        ))}

        {penalties[activeTab].length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No {activeTab} penalties found</p>
          </div>
        )}
      </div>

      {/* Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Appeal Penalty</h3>
            <p className="text-sm text-gray-600 mb-4">
              Penalty for Order {selectedPenalty?.order} -{" "}
              {selectedPenalty?.type}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Appeal
              </label>
              <textarea
                className="w-full p-2 border rounded-lg"
                rows="4"
                placeholder="Please provide a detailed explanation for your appeal..."
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
              ></textarea>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={submitAppeal}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
              >
                Submit Appeal
              </button>
              <button
                onClick={() => setShowAppealModal(false)}
                className="flex-1 bg-gray-100 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
