import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import Footer from "../components/footer";
import TransactionList from '../components/TransactionList';
import GroupSettingsModal from '../components/GroupSettingsModal';


interface GroupExpense {
  _id: string;
  group: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface Group {
  _id: string;
  name: string;
  admin: string;
  members: { _id: string; name: string }[];
  expenses: GroupExpense[];
  createdAt: Date;
  balances: [
    {
      user: { type: string; ref: "User" }; // User ID
      amount: { type: number; default: 0 }; // How much they owe (negative means they are owed money)
    }
  ];
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [ settingModal , setSettingMOdal]= useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitAmong, setSplitAmong] = useState<string[]>([]);

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // console.log("Stored Token:", localStorage.getItem("token"));
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("token sahi nahi hai bhai");
          return;
        }
        const response = await axios.get(
          "http://localhost:5001/api/group/user-groups",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.group) {
          console.log("Fetched groups data:", response.data.group);
          setGroups(response.data.group); // Ensure the structure matches
        } else {
          console.error("Unexpected response structure:", response.data);
        }
        // console.log("Stored Token:", localStorage.getItem("token"));
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);
  // console.log("Current groups state:", groups);
  
  const handleCreateGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("you are not logged in!!");
        return;
      }
      
      const membersArray = memberEmail.split(",").map((email) => email.trim());
      const response = await axios.post(
        "http://localhost:5001/api/group/create",
        {
          name: groupName,
          members: membersArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response.data);

      const newGroup = response.data.group;

      setGroups((prevGroups) =>
        Array.isArray(prevGroups) ? [...prevGroups, newGroup] : [newGroup]
      );

      setShowModal(false);
      setGroupName("");
      setMemberEmail("");
      alert("group ban gaya bhai");
      console.log("group ban gaya");
    } catch (error) {
      console.error("Error creating group: ", error);
      alert("Failed to create group");

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        alert(error.response.data.error); // Show the error from backend
      } else {
        alert("Failed to create group");
      }
    }
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleAddTransaction = async () => {
    if (
      !selectedGroup ||
      !amount ||
      !description ||
      !paidBy ||
      splitAmong.length === 0
    ) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Selected Group: groups ki details", selectedGroup);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5001/api/group/add-expense",
        {
          groupId: selectedGroup._id,
          amount,
          description,
          paidBy,
          splitAmong,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.expense) {
        const newExpense = response.data.expense;
        setSelectedGroup(prevGroup => {
          if (!prevGroup) return null;
          return {
            ...prevGroup,
            expenses: [...prevGroup.expenses, newExpense]
          };
        });
      }

      console.log("Transaction added:", response.data);
      const data = response.data.expense

      const updatedGroup = {
        ...selectedGroup,
        expenses: [...selectedGroup.expenses,data]
      }

      setSelectedGroup(updatedGroup);
      setTransactions(updatedGroup.expenses)

      // const data = response.data;
      console.log(data);
      alert("Transaction successfully added!");
      setShowTransactionModal(false);
      setAmount("");
      setDescription("");
      setPaidBy("");
      setSplitAmong([]);
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
    }
  };

  const handleAddMember = async () => {
    // if (!memberEmail) return alert("Please enter an email.");
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated");
        return;
      }
  
      if (!selectedGroup) {
        alert("No group selected.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5001/api/group/add-member",
        {
          groupId: selectedGroup._id, 
          email: memberEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert(response.data.message || "Member added successfully!");
      console.log("Member added:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding member:", error.response?.data || error.message);
      } else {
        console.error("Error adding member:", error);
      }
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to add member.");
      } else {
        alert("Failed to add member.");
      }
    }
  };

  const handleDeleteGroup = async () =>{
    try {
      const token = localStorage.getItem('token')
      if(!token){
      alert("User is not authenticated");
      return;
      }

      // const response = await axios

    } catch (error) {
      console.log("")
    }
  }
  

  return (
    <>
      <div className="bg-gray-900 min-h-screen text-white">
        {/* Navbar */}
        <Navbar />

        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-1/4 bg-gray-800 p-5 flex flex-col shadow-lg">
            {/* Create Group Button */}
            <button
              onClick={() => setShowModal(true)}
              className="mb-5 bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg shadow-md transition delay-150 duration-300 ease-in-out hover:-translate-y-1"
            >
              + Create Group
            </button>

            {/* Groups List (Scrollable) */}
            <div className="bg-gray-700 p-4 rounded-lg flex-1 overflow-y-auto">
              <h2 className="text-lg font-bold mb-4 border-b border-gray-500 pb-2">
                Your Groups
              </h2>
              <div className="space-y-3">
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <button
                      key={group._id}
                      className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-300 
                                ${
                                  selectedGroup?._id === group._id
                                    ? "bg-blue-500 text-white font-bold shadow-lg"
                                    : "bg-gray-600 hover:bg-gray-500"
                                }`}
                      onClick={() => handleGroupSelect(group)}
                    >
                      {group.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-300">No groups found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Group Content */}
          <div className="flex-1 bg-gray-900 p-5 overflow-y-auto">
            {selectedGroup ? (
              <div className="">
                {/* Group Header */}
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold">{selectedGroup.name}</h1>
                  <button 
                  onClick={() => {setSettingMOdal(true)}}
                  className="flex bg-gray-500 text-white rounded-lg p-2 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:bg-gray-600">
                    Settings
                  </button>
                </div>

                {/* Group Financial Summary */}
                <div className="flex justify-around gap-20 mt-2">
                  <h1 className="font-bold text-gray-300">Total: 502340 </h1>
                  <h1 className="font-bold text-green-500">Income: 102240</h1>
                  <h1 className="font-bold mr-20 text-red-500">Owe: 54322</h1>
                </div>

                {/* Group Details */}
                <div className="bg-stone-100 rounded-lg h-screen m-2 overflow-y-auto">
                  <div className="justify-center p-2 rounded-t-lg gap-5 bg-stone-400">
                    {/* Buttons for Group Actions */}
                    <div className="flex justify-between gap-3">
                      <button className="bg-red-500 p-3 rounded-lg w-1/4 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:bg-red-700">
                        - Settle Up
                      </button>
                      <button
                        className="bg-blue-500 p-3 rounded-lg w-1/4 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:bg-blue-700"
                        onClick={() => setShowTransactionModal(true)}
                      >
                        + Add Transaction
                      </button>
                      <button className="bg-emerald-700 p-3 rounded-lg w-1/4 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:bg-emerald-800">
                        All Members
                      </button>
                    </div>
                  </div>

                  {/* user details here */}
                  <div className=" chat  ">
                    {/* User Details - Show Transactions */}
                    {selectedGroup && <TransactionList selectedGroup={selectedGroup} />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white mt-20 text-2xl">
                Select a group to view details.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white">
              Create a Group
            </h2>
            <label className="text-gray-300">Group Name</label>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600"
            />
            <label className="text-gray-300">Add Members</label>
            <input
              type="text"
              placeholder="Enter emails (comma-separated)"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600"
            />
            <div className="flex justify-end">
              <button
                className="mr-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                onClick={handleCreateGroup}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            />
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            >
              <option value="">Paid by</option>
              {selectedGroup?.members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <select
              multiple
              value={splitAmong}
              onChange={(e) =>
                setSplitAmong(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            >
              {selectedGroup?.members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                className="mr-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                onClick={() => setShowTransactionModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={handleAddTransaction}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    <GroupSettingsModal
        isOpen={settingModal}
        onClose={() => setSettingMOdal(false)}
        onAddMember={handleAddMember}
        onDeleteGroup={handleDeleteGroup}
      />
    </>
  );
};

export default Groups;
