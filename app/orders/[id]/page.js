"use client";
import { useState } from "react";
import Link from "next/link";

export default function OrderDetails({ params }) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [otherMethod, setOtherMethod] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [photoProof, setPhotoProof] = useState(null);

  const handleDeliverySubmit = () => {
    // Handle delivery completion logic here
    console.log({
      deliveryMethod,
      otherMethod,
      photoProof,
    });
    setShowDeliveryModal(false);
  };

  const handleCancellation = () => {
    // Handle cancellation logic here
    console.log({ cancelReason });
    setShowCancelModal(false);
  };

  const handleSupportSubmit = () => {
    // Handle support contact logic here
    setShowSupportModal(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button className="mr-2">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Order #1234</h1>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
            In Progress
          </span>
          <span className="text-lg font-bold">₹950.00</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <svg
              className="w-4 h-4 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Ordered at: 2:30 PM</span>
          </div>
          <div className="flex items-center text-sm">
            <svg
              className="w-4 h-4 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Expected delivery: 3:00 PM</span>
          </div>
        </div>
      </div>

      {/* Delivery Locations */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-semibold mb-4">Delivery Route</h2>
        <div className="space-y-4">
          {/* Pickup Location */}
          <div className="flex">
            <div className="mr-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="font-medium">Pickup Location</p>
              <p className="text-sm text-gray-600">
                123 Restaurant Street, Mumbai
              </p>
              <p className="text-sm text-gray-500">Contact: +91 98765 43210</p>
            </div>
          </div>

          {/* Dotted Line */}
          <div className="ml-4 border-l-2 border-dashed h-8 border-gray-200"></div>

          {/* Drop Location */}
          <div className="flex">
            <div className="mr-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="font-medium">Drop Location</p>
              <p className="text-sm text-gray-600">
                456 Customer Avenue, Mumbai
              </p>
              <p className="text-sm text-gray-500">Contact: +91 98765 43211</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-semibold mb-4">Order Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order Type</span>
            <span>Food Delivery</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span>Online Payment</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Distance</span>
            <span>3.5 km</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items</span>
            <span>4 items</span>
          </div>
        </div>
      </div>

      {/* Customer Notes */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-semibold mb-2">Customer Notes</h2>
        <p className="text-sm text-gray-600">
          Please deliver to the security gate. Call when reached.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setShowDeliveryModal(true)}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-medium"
        >
          Mark as Delivered
        </button>
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium"
        >
          Cancel Order
        </button>
        <button
          onClick={() => setShowSupportModal(true)}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium"
        >
          Contact Support
        </button>
      </div>

      {/* Delivery Completion Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Delivery</h3>

            {/* Delivery Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was the order delivered?
              </label>
              <select
                className="w-full p-2 border rounded-lg mb-2"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              >
                <option value="">Select delivery method</option>
                <option value="handed">Handed to customer</option>
                <option value="door">Left at door</option>
                <option value="other">Other</option>
              </select>

              {deliveryMethod === "other" && (
                <input
                  type="text"
                  placeholder="Please specify"
                  className="w-full p-2 border rounded-lg"
                  value={otherMethod}
                  onChange={(e) => setOtherMethod(e.target.value)}
                />
              )}
            </div>

            {/* Photo Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Delivery Photo Proof
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhotoProof(e.target.files[0])}
                className="w-full"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeliverySubmit}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg"
              >
                Complete Delivery
              </button>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="flex-1 bg-gray-100 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select cancellation reason
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="customer_unavailable">
                  Customer unavailable
                </option>
                <option value="wrong_address">Wrong address</option>
                <option value="restaurant_closed">Restaurant closed</option>
                <option value="vehicle_breakdown">Vehicle breakdown</option>
                <option value="other">Other reason</option>
              </select>

              {cancelReason === "other" && (
                <textarea
                  placeholder="Please specify the reason"
                  className="w-full p-2 border rounded-lg mt-2"
                  rows="3"
                ></textarea>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancellation}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg"
              >
                Cancel Order
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 py-2 rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Contact Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Contact Support</h3>

            <div className="space-y-4 mb-6">
              <button className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white p-4 rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Call Support</span>
              </button>

              <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white p-4 rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Chat with Support</span>
              </button>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full bg-gray-100 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
