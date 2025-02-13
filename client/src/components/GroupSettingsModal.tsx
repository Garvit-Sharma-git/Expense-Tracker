import { useState } from "react";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (email: string) => void;
  onDeleteGroup: () => void;
}

const GroupSettingsModal = ({ isOpen, onClose, onAddMember, onDeleteGroup }: GroupSettingsModalProps) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Settings</h2>

        {/* Add Member Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Add Member by Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter member's email"
          />
          <button
            onClick={() => onAddMember(email)}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Add Member
          </button>
        </div>

        {/* Delete Group Section */}
        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Danger Zone</h3>
          <button
            onClick={onDeleteGroup}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Delete Group
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
