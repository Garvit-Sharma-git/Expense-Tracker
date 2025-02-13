import React , { useState } from 'react';
import axios from 'axios';

interface ExpenseFormData{
    type:string;
    category:string;
    amount:number;
    date:string;
    description:string;
}

const Form:React.FC=()=>{

    const [formData,setFormData]=useState<ExpenseFormData>({
        type:"",
        category:"",
        amount:0,
        date:"",
        description:"",
    })

    const handleChange=(e:React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>)=>{
        const { name, value}=e.target;
        setFormData((prevData)=>({
            ...prevData,
            [name]:value,
        }))
    }

    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault;
        
        
        try {
            const userId = localStorage.getItem('userId');  
            // if (!userId) {
            //     alert('User not authenticated');
            //     return;
            // }
            const requestData = { ...formData, userId };
            const response = await axios.post('http://localhost:5001/api/auth/expenses', requestData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,  // Ensure the user is authenticated
                },
            });
    
            alert('Transaction added successfully');
            setFormData({ type: "", category: "", amount: 0, date: "", description: "" });  // Clear form
        } catch (error: any) {
            alert(error.response?.data?.error || 'Something went wrong');
        }
    }
    

    return(
        <>
            <div className='bg-stone-200 '>
                <div className='flex items-cente justify-center gap-3'>
                
                <h1 className='text-black mt-5 text-3xl font-bold justify  text-center'>You can add your Individual Transactions here</h1>
                {/* <p>Here you can add your individual transactions to track your daily expenses or income</p> */}
                <button className="mt-8 text-black text-xs w-4 h-4 border border-gray-400 rounded-lg  transition-all duration-200 ease-in-out cursor-pointer hover:border  hover:bg-gray-300" 
                title="You can add your income as well as expense with some fields required to track your daily expenses or income">
                    ?
                    </button>
                </div>
                {/* <p className="text-center flex justify-center items-center mt-3 text-black bg-yellow-500 max-w-fit rounded-md p-2">
  Here you can add your individual transactions to track your daily expenses or income.
</p> */}
                {/* <p className='text-center flex justify-center items-center mt-3 text-black bg-yellow-500 max-w-fit rounded-md p-2'>Here you can add your individual transactions to track your daily expenses or income.</p> */}
                <div className='text-black h-2/3  p-7   '>
                {/* <h1 className='text-xl '>form</h1> */}
                    <form onSubmit={handleSubmit} className="w-2/3  h-full mx-auto bg-gray-400 p-6 rounded-lg shadow-md ">
                    {/* <h1 className='text-center border-b border-gray-900 text-3xl font-bold'>Form</h1> */}
                        <div className=" mb-4 ">
                            <label
                            htmlFor="type"
                            className="block  text-sm font-bold text-xl text-black mb-1"
                            >
                            Type:
                            </label>
                            <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-200 border-black  rounded-lg h-10 focus:ring-black focus:border-black"
                            >
                            <option value="">Select Type</option>
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                            </select>
                        </div>

                        <div className="mb-4  ">
                            <label
                            htmlFor="category"
                            className="block text-sm text-xl font-bold text-black mb-1"
                            >
                            Category:
                            </label>
                            <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-200 border-gray-300 h-10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
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

                        <div className="mb-4">
                            <label
                            htmlFor="amount"
                            className="block text-sm text-xl font-bold text-black mb-1"
                            >
                            Amount:
                            </label>
                            <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-200 border-gray-300 h-10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                            htmlFor="date"
                            className="block text-sm text-xl font-bold text-black mb-1"
                            >
                            Date:
                            </label>
                            <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-200 h-10 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                            htmlFor="description"
                            className="block text-sm  text-xl font-bold text-black mb-1"
                            >
                            Description (optional):
                            </label>
                            <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            
                            className="w-full bg-gray-200 h-20 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                        </div>

                        <div className='flex justify-center '>
                            <button
                             type="submit"
                            // onClick={handleSubmit}
                            
                            className="bg-black text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110  hover:bg-black-300"
                            >
                            Submit
                            </button>
                        </div>
                    </form>
                    
                </div>
            </div>
        
        </>
    )
    
}


export default Form;

