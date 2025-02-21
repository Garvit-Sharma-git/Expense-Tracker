import { useEffect, useState } from "react";
import axios from "axios";

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

const MembersModal = ({ isOpen, onClose, groupId }: MembersModalProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchGroupMembers();
    }
  }, [isOpen]);

  const fetchGroupMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated");
        return;
      }

      const response = await axios.get(
        `http://localhost:5001/api/group/group-members/${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMembers(response.data.members);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching members", error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Group Members</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : members.length > 0 ? (
          <div>
            {members.map((member) => (
                <div className="overflow-y  bg-gray-700 rounded-lg">
                    <ul key={member._id} className="border-b border-gray-500 p-3 rounded-lg   text-white">
                        <span className="font-medium">{member.name}</span> - {member.email}
                    </ul>

                </div>
              
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No members found.</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-emerald-600 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MembersModal;
