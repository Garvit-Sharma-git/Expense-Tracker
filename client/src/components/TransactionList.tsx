import React from 'react';
import { jwtDecode } from "jwt-decode";

// Function to get logged-in user's ID from token
// const getLoggedInUserId = (): string | null => {
//   const token = localStorage.getItem("token"); // Get token from localStorage
//   if (!token) return null;

//   try {
//     const decoded: any = jwtDecode(token); // Decode token
//     return decoded.userId; // Assuming the token contains 'userId'
//   } catch (error) {
//     console.error("Invalid token", error);
//     return null;
//   }
// };

// const loggedInUserId = getLoggedInUserId();

interface Member {
  _id: string;
  name: string;
}

interface user{
    id: string;
    name: string;
    email: string;
    friends: string[];
    friendRequests: string[];
    groupIds:string[]
  };



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
  members: Member[];
  expenses: GroupExpense[];
  createdAt: Date;
  balances: Array<{
    user: { type: string; ref: "User" };
    amount: { type: number; default: 0 };
  }>;
}

interface TransactionListProps {
  selectedGroup: Group;
}

const TransactionList: React.FC<TransactionListProps> = ({ selectedGroup }) => {

    const getLoggedInUserId = (): string | null => {
        const token = localStorage.getItem("token"); // Get token from localStorage
        if (!token) return null;
      
        try {
          const decoded: any = jwtDecode(token); // Decode token
          return decoded.id; // Assuming the token contains 'userId'
        } catch (error) {
          console.error("Invalid token", error);
          return null;
        }
      };
      
      
  if (!selectedGroup || !selectedGroup.expenses) {
    return <div className="text-gray-600 p-4">No transactions yet.</div>;
  }

  if (selectedGroup.expenses.length === 0) {
    return <div className="text-gray-600 p-4">No transactions yet.</div>;
  }
  const loggedInUserId = getLoggedInUserId();
  return (
    // <div className="flex flex-col gap-4 p-4 ">
    //   {selectedGroup.expenses.map((expense: GroupExpense) => (
    //     <div key={expense._id} className="bg-stone-200 rounded-lg p-4 shadow-md ">
    //       <div className="flex justify-between items-center mb-2">
    //         <div className="flex items-center gap-2">
    //           <div className="bg-blue-500 rounded-full p-2">
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-6 w-6 text-white"
    //               fill="none"
    //               viewBox="0 0 24 24"
    //               stroke="currentColor"
    //             >
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth={2}
    //                 d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    //               />
    //             </svg>
    //           </div>
    //           <div>
    //             <h3 className="text-lg font-semibold text-gray-800">{expense.description}</h3>
    //             <p className="text-sm text-gray-600">
    //               Paid by: {selectedGroup.members.find(m => m._id === expense.paidBy)?.name}
    //             </p>
    //           </div>
    //         </div>
    //         <div className="text-right">
    //           <p className="text-xl font-bold text-gray-800">₹{expense.amount}</p>
    //           <p className="text-sm text-gray-600">
    //             {new Date(expense.date).toLocaleDateString()}
    //           </p>
    //         </div>
    //       </div>
    //       <div className="mt-2 pt-2 border-t border-gray-300">
    //         <p className="text-sm text-gray-600">Split between:</p>
    //         <div className="flex flex-wrap gap-2 mt-1">
    //           {expense.splitAmong.map((userId: string) => (
    //             <span
    //               key={userId}
    //               className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full"
    //             >
    //               {selectedGroup.members.find(m => m._id === userId)?.name}
    //             </span>
    //           ))}
    //         </div>
    //       </div>
    //     </div>
    //   ))}
    // </div>
    <div className="flex flex-col gap-4 p-4">
  {selectedGroup.expenses.map((expense: GroupExpense) => {
    console.log(expense.paidBy, loggedInUserId)
    const isCurrentUser = expense.paidBy === loggedInUserId; // Check if logged-in user added the expense

    return (
      <div 
        key={expense._id}
        className= {` flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        <div className="bg-stone-200 rounded-lg p-4 shadow-md max-w-[70%]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{expense.description}</h3>
                <p className="text-sm text-gray-600">
                  Paid by: {selectedGroup.members.find(m => m._id === expense.paidBy)?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">₹{expense.amount}</p>
              <p className="text-sm text-gray-600">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p className="text-sm text-gray-600">Split between:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {expense.splitAmong.map((userId: string) => (
                <span
                  key={userId}
                  className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full"
                >
                  {selectedGroup.members.find(m => m._id === userId)?.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>


  );
};

export default TransactionList;