export default function LoginHistory() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Login History</h1>

      <div className="bg-white rounded-lg shadow">
        {/* Current Session */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-2">Current Session</h2>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2"
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
            <span>Started: Today, 9:30 AM</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Mumbai, India</span>
          </div>
        </div>

        {/* Previous Sessions */}
        <div className="divide-y">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Session #{item}</span>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
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
                <span>Duration: 8 hours</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Mumbai, India</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
