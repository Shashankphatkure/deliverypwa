"use client";
import { useState } from "react";

export default function Home() {
  const [isDriverModeOn, setIsDriverModeOn] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingState, setPendingState] = useState(false);

  const handleToggle = (newState) => {
    setPendingState(newState);
    setShowConfirmModal(true);
  };

  const confirmToggle = () => {
    setIsDriverModeOn(pendingState);
    setShowConfirmModal(false);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, Driver!</h1>
        <p className="text-gray-600">Your dashboard overview</p>
      </div>

      {/* Driver Mode Toggle */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Driver Mode</span>
            <p className="text-sm text-gray-500">Active time today: 6h 30m</p>
          </div>
          <button
            onClick={() => handleToggle(!isDriverModeOn)}
            className={`px-4 py-2 rounded-full transition-colors ${
              isDriverModeOn
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {isDriverModeOn ? "Turn Off" : "Turn On"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {pendingState ? "Turn On Driver Mode?" : "Turn Off Driver Mode?"}
            </h3>
            <p className="text-gray-600 mb-4">
              {pendingState
                ? "You will start receiving delivery requests."
                : "You will stop receiving new delivery requests."}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmToggle}
                className={`flex-1 py-2 rounded-lg ${
                  pendingState
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Today's Earnings</h3>
          <p className="text-2xl font-bold">₹950.00</p>
          <p className="text-sm text-green-600">+₹150 from yesterday</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Today's Orders</h3>
          <p className="text-2xl font-bold">8</p>
          <div className="flex items-center text-sm text-gray-500">
            <span className="text-green-600">6 completed</span>
            <span className="mx-1">•</span>
            <span className="text-red-600">2 cancelled</span>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Today's Progress</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Orders Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Orders Target</span>
              <span className="font-medium">8/15 orders</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{ width: "53%" }}
              ></div>
            </div>
          </div>

          {/* Earnings Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Earnings Target</span>
              <span className="font-medium">₹950/₹2000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2"
                style={{ width: "47.5%" }}
              ></div>
            </div>
          </div>

          {/* Active Time */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Active Time</span>
              <span className="font-medium">6.5/8 hours</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 rounded-full h-2"
                style={{ width: "81%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {[
            { type: "completed", time: "15 mins ago", amount: "₹150" },
            { type: "cancelled", time: "1 hour ago", amount: "₹0" },
            { type: "completed", time: "2 hours ago", amount: "₹200" },
          ].map((activity, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === "completed"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <div>
                  <p className="font-medium">Order #{1234 + index}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              <span
                className={`font-medium ${
                  activity.type === "completed"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {activity.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
