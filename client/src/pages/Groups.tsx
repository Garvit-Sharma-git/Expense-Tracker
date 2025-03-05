import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import Footer from "../components/footer";
import TransactionList from '../components/TransactionList';
import GroupSettingsModal from '../components/GroupSettingsModal';
import MembersModal from '../components/MembersModal';
import SettleUpModal from "../components/settleUp";


interface custom extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    friends: string[];
    friendRequests: string[];
    groupIds:string[]
  };
}

interface GroupExpense {
  _id: string;
  group: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  splitDetails:{}[];
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

  const [ isModalOpen,setIsModalOpen ] = useState(false);
  const [settlements, setSettlements] = useState<{ from: string; to: string; amount: number; fromName: string; toName: string }[]>([]);


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
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const token =localStorage.getItem('token')

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
    
    const splitDetails = splitAmong.map((userId) =>({
      user: userId,
      amount: Number(amount) / splitAmong.length

    }))

    try {
      // const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5001/api/group/add-expense",
        {
          groupId: selectedGroup._id,
          amount,
          description,
          paidBy,
          splitAmong,
          splitDetails,
         
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

  const handleAddMember = async (email:string) => {

    if (!email.trim()) {
      alert("Please enter a valid email.");
      return;
    }

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

      const requestBody = {
        groupId: selectedGroup._id,
        email: email.trim().toLowerCase(),
      };
  
      console.log("Sending request body:", JSON.stringify(requestBody, null, 2)); 

      const response = await axios.post(
        "http://localhost:5001/api/group/add-member",
        requestBody,
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

      if(!selectedGroup){
        console.log("No group selected: ");
        return;
      }
      const confirmDelete = window.confirm("Are you sure you want to delete this group? ");
      if (!confirmDelete) return;

      const response = await axios.delete(
        `http://localhost:5001/api/group/delete/${selectedGroup._id}`,  
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || "Group deleted successfully!");
    console.log("Group deleted:", response.data);
    setSettingMOdal(false);

    } catch (error) {
      console.log("delete me dikkat")
      console.error("Error deleting group:", error);
    alert("Failed to delete group.");
    }
  }
  
  const handleRemoveMember = async (email: string) => {
    console.log(email);
    try {
      // const token =localStorage.getItem('token')
      const response = await axios.delete(
        `http://localhost:5001/api/group/remove-member/${selectedGroup?._id}/${email}`,  
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || "Member removed successfully!");
    console.log("Member removed:", response.data);

    } catch (error) {
      console.error("Error removing member:", error);
    alert("Failed to remove member.");
    }
  }

  const handleSettleUp = async () => {
    try {
      const groupId= selectedGroup?._id;
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated");
        return;
      }
      if (!groupId) {
        alert("No group selected.");
        return;
      }
      const response = await fetch("http://localhost:5001/api/group/settle-up",{
        method:"POST",
        headers:{
          "Content-type":"application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      })
      const data = await response.json()
      console.log("Settle up data:", data);
      if(response.ok){
        const settlementsWithNames = data.settlements.map((settlement: any) => ({
          ...settlement,
          fromName: selectedGroup?.members.find(member => member._id === settlement.from)?.name || "",
          toName: selectedGroup?.members.find(member => member._id === settlement.to)?.name || ""
        }));
        setSettlements(settlementsWithNames);
        setIsModalOpen(true)
      }else {
        console.error("Error:", data.message);
      } 
      
      
    } catch (error) {
      console.error("Error fetching settlements", error);
    }
  }

  const confirmSettlement = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated");
      return;
    }
  
    for (const settlement of settlements) {  
      await fetch("http://localhost:5001/api/group/confirm-settlement", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          groupId: selectedGroup?._id, 
          fromUserId: settlement.from, 
          toUserId: settlement.to, 
          amount: settlement.amount
        }),
      });
    }
  
    setIsModalOpen(false);
  };


  
  const downloadGroupHistory = async (groupId: string) => {
    try {
        if (!groupId) {
            console.error("Error: groupId is undefined");
            return;
        }

        // Retrieve token from localStorage (or however you store it)
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, authorization denied");
            return;
        }

        const response = await fetch(
            `http://localhost:5001/api/group/download-history/${groupId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,  
                    "Content-Type": "application/pdf",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to download file");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `group-history-${groupId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert("History downloaded successfully!");
    } catch (error) {
        console.error("Error downloading history:", error);
    }
};


  

  return (
    <>
      <div className="bg-gray-900 min-h-screen text-white">
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

                {/* Download the pdf */}
                <div className="flex flex-col justify-end items-end mt-3">
                <button onClick={() => {console.log("Downloading for group:", selectedGroup?._id);
                  downloadGroupHistory(selectedGroup._id);}} className="p-2 rounded-lg bg-cyan-700 hover:bg-cyan-900 ransition delay-150 duration-300 ease-in-out hover:-translate-y-1">Download PDF</button>
                </div>
                

                {/* Group Details */}
                <div className="bg-stone-100 rounded-lg h-screen m-2 overflow-y-auto">
                  <div className="justify-center p-2 rounded-t-lg gap-5 bg-stone-400">
                    {/* Buttons for Group Actions */}
                    <div className="flex justify-between gap-3">
                      <button 
                      onClick={() => {
                        console.log("Settle up button clicked yo ::");
                        handleSettleUp();
                      }}
                      className="bg-red-500 p-3 rounded-lg w-1/4 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:bg-red-700">
                        - Settle Up
                      </button>
                      <button
                        className="bg-blue-500 p-3 rounded-lg w-1/4 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:bg-blue-700"
                        onClick={() => setShowTransactionModal(true)}
                      >
                        + Add Transaction
                      </button>
                      <button 
                      onClick={() => {setIsMembersModalOpen(true)}}
                      className="bg-emerald-700 p-3 rounded-lg w-1/4 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:bg-emerald-800">
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
            <label htmlFor="" className="font-medium text-gray-300">Amount</label>
            <input 
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"

            />
            <label htmlFor="" className="font-medium text-gray-300">Description</label>
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
              className="w-full mt-3 p-2 mb-4 rounded bg-gray-700 text-white"
            >
              <option value="">Paid by</option>
              {selectedGroup?.members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <label htmlFor="" className="font-medium text-gray-300">Spilt Among</label>
            <select
              multiple
              value={splitAmong}
              onChange={(e) =>
                setSplitAmong(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full p-2 mb-4 overflow-y rounded bg-gray-700 text-white"
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

<SettleUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settlements={settlements}
        // onConfirm={confirmSettlement}
        groupId={selectedGroup?._id || ""}
      />

    <GroupSettingsModal
        isOpen={settingModal}
        onClose={() => setSettingMOdal(false)}
        onAddMember={handleAddMember}
        onDeleteGroup={handleDeleteGroup}
        onRemoveMember={handleRemoveMember}
      />
      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        groupId={selectedGroup?._id || ""}
      />
    </>
  );
};

export default Groups;
