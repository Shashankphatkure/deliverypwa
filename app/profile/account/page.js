export default function AccountSettings() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Personal Information</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              defaultValue="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg"
              defaultValue="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full p-2 border rounded-lg"
              defaultValue="+91 98765 43210"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Vehicle Information</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <select className="w-full p-2 border rounded-lg">
              <option>Two Wheeler</option>
              <option>Three Wheeler</option>
              <option>Four Wheeler</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              defaultValue="MH 01 AB 1234"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Bank Details</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              defaultValue="XXXX XXXX XXXX 1234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              defaultValue="ABCD0001234"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full bg-blue-500 text-white py-2 rounded-lg">
        Save Changes
      </button>
    </div>
  );
}
