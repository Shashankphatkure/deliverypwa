export default function Penalties() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Penalties</h1>

      {/* Penalties Summary */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Total Penalties</p>
            <p className="text-2xl font-bold">₹0.00</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Active Penalties</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      {/* Penalties List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Penalty History</h2>
        </div>

        {/* Empty State */}
        <div className="p-8 text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>No penalties found</p>
          <p className="text-sm mt-1">Keep up the good work!</p>
        </div>
      </div>
    </div>
  );
}
