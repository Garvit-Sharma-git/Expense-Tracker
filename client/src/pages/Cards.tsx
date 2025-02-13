import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate,Link } from "react-router-dom";
import Footer from "../components/footer";

interface Expense {
  _id: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

const ExpensesTable: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>("");


  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token=localStorage.getItem('token');
        const response = await axios.get("http://localhost:5001/api/auth/expenses",{
            headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses :<", error);
      }
    };

    fetchExpenses();
  }, []);

  const deleteExpense = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/auth/expenses/${id}`);
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense._id !== id));
    //   alert("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense.");
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };
  
  const handleDeleteClick = (expense:Expense)=>{
    setDeletingExpense(expense);
    setShowModal2(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingExpense) {
      setEditingExpense({
        ...editingExpense,
        [e.target.name]: e.target.value,
      });
    }
  };

  const updateExpense = async () => {
    if (!editingExpense) return;
    try {
      const response = await axios.put(`http://localhost:5001/api/auth/expenses/${editingExpense._id}`, editingExpense);
      setExpenses(expenses.map((exp) => (exp._id === editingExpense._id ? response.data : exp)));
      setShowModal(false);
      alert("Expense Updated Successfully");
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense.");
    }
  };

  const filteredExpenses = expenses
  .filter(expense => {
    if (filterType && expense.type !== filterType) return false;
    if (filterMonth && !expense.date.startsWith(filterMonth)) return false;

    if (
      searchQuery &&
      !expense.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !expense.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !expense.amount.toString().includes(searchQuery)
    ) {
      return false;
    }

    return true;
  })
  .sort((a, b) => {
    if (sortOrder === "latest") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortOrder === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
    return 0;
  });


  return (
    <div className="bg-stone-200  min-h-screen text-black ">
      <Navbar />

      {/* Table Section */}
      <div className="container mx-auto p-6">
        
        <div className="overflow-x-auto ">

            <div className="flex justify-between p-2 mb-2 ">
                <Link to="/home" className=" text-white bg-gray-800 py-2 px-4 rounded-lg transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110">
                    + Add Transaction
                </Link>
                <div className="flex justify-end gap-5 items-center ">
                <input
                  type="text"
                  placeholder="Search "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border text-white rounded-md w-60"
                />
                <button className="bg-gray-800 text-white py-2 px-4 rounded-lg transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110 
                "
                onClick={() => setShowFilterModal(true)}>Filter</button>
                <button className="bg-gray-800 text-white py-2 px-4 rounded-lg transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110" 
                onClick={() => setShowSortModal(true)}>Sort</button>
            </div>
            </div>

            
            
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="">
              <tr className="bg-black text-white ">
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className={`border-b border-gray-300 hover:bg-white ${expense.type === "Income" ? "bg-green-100" : "bg-red-100"}`}>

                  <td className={`py-3 px-4 font-bold uppercase ${
                    expense.type === "Income" ? "text-green-500" : "text-red-500"
                    }`}>{expense.type}</td>

                  <td className="py-3 px-4">{expense.category}</td>
                  <td className="py-3 px-4">₹{expense.amount}</td>
                  <td className="py-3 px-4">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 truncate max-w-[200px]" title={expense.description}>
                    {expense.description}
                  </td>
                  <td className="py-3 px-4 flex justify-center space-x-2">
                    <button
                      onClick={() => handleDeleteClick(expense)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEditClick(expense)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 "
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && editingExpense && (
        <div className="fixed inset-0 flex items-center  justify-center text-white rounded-lg bg-black bg-opacity-50">
          <div className="bg-white  rounded-lg shadow-lg w-100 bg-sky-100 ">
            
            <h2 className="text-xl font-bold mb-4 text-white bg-blue-600 h-15  text-center items-center justify-center p-2">Edit Expense</h2>

            <div className="p-5">
                {/* Type */}
            <div>
            <label htmlFor="" className="text-black font-bold">Type</label>
            <select
              name="type"
              value={editingExpense.type}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 h-10 rounded mb-2 bg-black"
            >
              <option value="">Select Type</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>

            </div>
            

            {/* Category */}
            <div>
                <label htmlFor="" className="text-black font-bold">Category</label>
            <select
              name="category"
              value={editingExpense.category}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded mb-2"
            >
              <option value="">Select Category</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="hawabazi">Hawabazi</option>
              <option value="others">Others</option>
            </select>

            </div>
            

            {/* Amount */}
            <label htmlFor="" className="text-black font-bold">Amount</label>
            <input
              type="number"
              name="amount"
              value={editingExpense.amount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Amount"
            />

            {/* Date */}
            <label htmlFor=""className="text-black font-bold">Date</label>
            <input
              type="date"
              name="date"
              value={editingExpense.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />

            {/* Description */}
            <label htmlFor="" className="text-black font-bold">Description</label>
            <textarea
              name="description"
              value={editingExpense.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Description"
            ></textarea>

            </div>

            

            {/* Buttons */}
            <div className="flex justify-end space-x-2 p-4">
              <button onClick={() => setShowModal(false)} className="bg-red-400 text-white py-1 px-4 rounded-lg">
                Cancel
              </button>
              <button onClick={updateExpense} className="bg-blue-400 text-white py-1 px-4 rounded-lg">
                Save
              </button>
            </div>
          </div>
          
        </div>
        
      )}
      {showModal2 && deletingExpense && (
        <div className="fixed inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-black">Delete Expense</h2>
            <p className="text-gray-700">Are you sure you want to delete this expense?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowModal2(false)} className="bg-red-400 text-white py-1 px-4 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteExpense(deletingExpense._id);
                  setShowModal2(false);
                }}
                className="bg-blue-400 text-white py-1 px-4 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Filter Modal */}
{showFilterModal && (
  <div className="fixed inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4 text-black">Filter Transactions</h2>

      {/* Filter by Type */}
      <label className="text-black font-bold">Type:</label>
      <select
        value={filterType || ""}
        onChange={(e) => setFilterType(e.target.value || null)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
      >
        <option value="">All</option>
        <option value="Income">Income</option>
        <option value="Expense">Expense</option>
      </select>

      {/* Filter by Month */}
      <label className="text-black font-bold">Month:</label>
      <input
        type="month"
        value={filterMonth || ""}
        onChange={(e) => setFilterMonth(e.target.value || null)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />

      {/* Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => setShowFilterModal(false)} className="bg-red-400 text-white py-1 px-4 rounded-lg">
          Cancel
        </button>
        <button onClick={() => setShowFilterModal(false)} className="bg-blue-400 text-white py-1 px-4 rounded-lg">
          Apply
        </button>
      </div>
    </div>
  </div>
)}

{/* Sort Modal */}
{showSortModal && (
  <div className="fixed inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4 text-black">Sort Transactions</h2>

      <label className="text-black font-bold">Sort By:</label>
      <select
        value={sortOrder || ""}
        onChange={(e) => setSortOrder(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
      >
        <option value="">None</option>
        <option value="latest">Latest First</option>
        <option value="oldest">Oldest First</option>
      </select>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => setShowSortModal(false)} className="bg-red-400 text-white py-1 px-4 rounded-lg">
          Cancel
        </button>
        <button onClick={() => setShowSortModal(false)} className="bg-blue-400 text-white py-1 px-4 rounded-lg">
          Apply
        </button>
      </div>
    </div>
  </div>
)}


      {/* <Footer /> */}
    </div>
  );
};

export default ExpensesTable;
