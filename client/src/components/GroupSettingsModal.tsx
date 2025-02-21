import { useState } from "react";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (email: string) => void;
  onRemoveMember: (email: string) => void;
  onDeleteGroup: () => void;
}

const GroupSettingsModal = ({ isOpen, onClose, onAddMember, onDeleteGroup ,onRemoveMember }: GroupSettingsModalProps) => {
  const [email, setEmail] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Group Settings</h2>

        {/* Add Member Section */}
        <div className="mb-4 p-3">
          <label className="block text-sm font-medium text-gray-300">Add Member by Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2  rounded-lg "
            placeholder="Enter member's email"
          />
          <button
            onClick={() => {
              onAddMember(email.trim());
              
            }}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Add Member
          </button>
        </div>


            {/* Remove Member Section */}
        <div className="mb-4 border-t p-3 border-gray-500 ">
          <label className="block mt-4 text-sm font-medium text-gray-300">Remove a Member by email</label>
          <input
            type="email"
            value={removeEmail}
            onChange={(e) => setRemoveEmail(e.target.value)}
            className="w-full mt-1 p-2  rounded-lg   "
            placeholder="Enter member's email"
          />
          <button
            onClick={() => {
              
              
              if (removeEmail.trim()) {
                onRemoveMember(removeEmail.trim()); 
              } else {
                alert("Please enter a valid email.");
              }
            }}
            className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Remove a Member
          </button>
        </div>
        

        {/* Delete Group Section */}
        <div className="mt-4 border-t p-3 pt-4 border-gray-500">
          <h3 className="text-red-600 mt-1 text-center  font-bold mb-2">Danger Zone</h3>
          
          <button
            onClick={onDeleteGroup}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Delete this Group
          </button>
        </div>

  
        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-2 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
