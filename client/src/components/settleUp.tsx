import React, { useState } from "react";
import axios from "axios";

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlements: { from: string; to: string; amount: number; fromName: string; toName: string }[];
  // onConfirm: () => void;
  groupId: string;
}

const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  settlements,
  // onConfirm,
  groupId,
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [settleAmount, setSettleAmount] = useState("");

  if (!isOpen) return null;

  

  const handleConfirmSettlement = async (settlement: { from: string; to: string; amount: number; fromName:string; toName:string }, partialAmount: number) => {
    try {
      if (!groupId || !settlement || partialAmount <= 0) {
        console.error("Invalid settlement request");
        return;
      }


      console.log("Sending request with:", {
        groupId,
        fromUserId: settlement.from,
        toUserId: settlement.to,
        amount: partialAmount,
      });
  
      const token = localStorage.getItem("token"); // Get the token from local storage
      const response = await axios.post(
        "http://localhost:5001/api/group/add-expense",
        {
          groupId,
          amount: partialAmount,
          description: "Settlement",
          paidBy: settlement.from,
          splitAmong: [settlement.to],
          splitDetails: [{ user: settlement.to, amount: partialAmount  }],
         
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // const response = await fetch("http://localhost:5001/api/group/confirm-settlement", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`, // Include the token
      //   },
      //   body: JSON.stringify({
      //     groupId,
      //     fromUserId: settlement.from, 
      //     toUserId: settlement.to, 
      //     amount: partialAmount, // Send the partial amount entered by the user
      //   }),
      // }); 
  
      const data = await response;
      if (!response) {
        console.error("Settlement failed:", data);
        return;
      }
  
      console.log("Settlement successful", data);
      
      // Update UI after successful settlement
      // onConfirm();
    } catch (error) {
      console.error("Error confirming settlement:", error);
    }
  };
  

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="modal-content bg-gray-800 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-3">Settle Up</h2>
        <p>Select a transaction and enter an amount to settle:</p>
        <ul className="bg-black mb-4 p-3 rounded-lg mt-3">
          {settlements.map((settle, index) => (
            <li
              key={index}
              onClick={() => setSelectedTransaction(index)}
              className={`cursor-pointer p-2 rounded-lg ${
                selectedTransaction === index ? "bg-blue-700" : "bg-gray-700"
              }`}
            >
              <strong>{settle.fromName}</strong> pays <strong>{settle.toName}</strong> ₹{settle.amount }
            </li>
          ))}
        </ul>

        {selectedTransaction !== null && (
          <div>
            <label>Enter Amount to Settle: </label>
            <input
              type="number"
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="p-2 rounded bg-gray-600 text-white w-full"
            />
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => {
              console.log("Confirming settlement button is clicked inside modal of settle ::::");
              if (selectedTransaction !== null) {
                handleConfirmSettlement(settlements[selectedTransaction], parseFloat(settleAmount));
              }
            }}
            className="bg-indigo-700 mr-5 p-2 rounded-lg"
          >
            Confirm Settlement
          </button>
          <button onClick={onClose} className="bg-red-700 p-2 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettleUpModal;

