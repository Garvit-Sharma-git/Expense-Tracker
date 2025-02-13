import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User{
    name:string;
    email:string;
}

const Navbar: React.FC = () => {
    const[isDropdownOpen,setIsDropdownOpen]=useState(false);
    const[ isModalOpen, setIsModalOpen ] = useState(false);
    const [ user,setUser] = useState<User | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(()=>{
        const fetchUserData=async()=>{
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5001/api/auth/user", {
                    headers: { Authorization: `Bearer ${token}` }, 
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        }
        fetchUserData();
    },[])

    const toggleDropdown=()=>{
        setIsDropdownOpen(!isDropdownOpen);
    }

    const openModal = () => {
        setIsModalOpen(true);
        setIsDropdownOpen(false);
    }

    const closeModal = () => {
        setIsModalOpen(false);
    }

    const openLogoutModal = () => {
        setIsLogoutModalOpen(true);
        setIsDropdownOpen(false); // Close dropdown on logout confirmation
      };
    
      // Close logout confirmation modal
      const closeLogoutModal = () => {
        setIsLogoutModalOpen(false);
      };
    
    const logout = () => {
        localStorage.removeItem('token');
        window.location.href='/login';
        
        
    }

    return (
        <>
            <nav className="bg-black  shadow-md">
            <div className="max-w-7xl  mx-auto px-1 sm:px-6 lg:px-8">
                <div className="flex  justify-between h-16">
                    {/* Left wala */}
                    <div className="flex  items-center ">
                        <div className="flex-shrink-0">
                            <a href='/home' className="text-white text-xl font-bold">Juntrax</a>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <a
                                href="/home"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Add Transaction 
                            </a>
                            <a
                                href="/home/transactions"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                All Transactions
                            </a>
                            <a
                                href="/home/Groups"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Groups
                            </a>
                            <a
                                href="/home/Dashboard"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </a>
                            <a
                                href="/"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                About
                            </a>
                        </div>
                    </div>

                    {/* Right wala */}
                    <div className="flex items-center ">
                        <div className="relative  ">
                            <button
                                type="button"
                                onClick={toggleDropdown}
                                className="flex  items-center text-sm text-black focus:outline-none  transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110  "
                                id="profile-menu-button"
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                            >
                                <span className="sr-only">Open user menu</span>
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src="../src/assets/pro4.avif"
                                    alt="User Profile"
                                />
                            </button>

                            {/* Dropdown menu */}
                            {isDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="profile-menu-button"
                            >
                                
                                <a
                                    onClick={openModal}
                                    
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Profile
                                </a>
                                <a
                                    href="#settings"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Config
                                </a>
                                <a
                                    onClick={openLogoutModal}
                                    className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Logout
                                </a>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>

                {isModalOpen && (
                <div className="fixed inset-0 flex text-black items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-96 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">  Profile</h2>
                            <button
                                onClick={closeModal}
                                className="text-red-500  text-xl font-bold hover:text-red-700 focus:outline-none"
                            >
                                &times;
                                
                            </button>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    className="h-16 w-16 rounded-full transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110  hover:bg-pink-800"
                                    src="../src/assets/pro4.avif"
                                    alt="User Profile"
                                />
                                <div>
                                    <p className="text-lg text-gray-600 font-medium">{user?.name || "Loading.."}</p>
                                    <p className="text-sm text-gray-600">{user?.email || "Loading.."}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-black text-white py-2 px-4 rounded-lg shadow-md  focus:ring-2 focus:ring-blue-400 focus:outline-none transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110  hover:bg-pink-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
        {isLogoutModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-96 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-black">My Dear Friend you sure you wanna logout?</h2>
                <div className="flex justify-between">
                <button
                    onClick={closeLogoutModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110"
                >
                    Cancel
                </button>
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1  hover:scale-110"
                >
                    Logout
                </button>
                </div>
            </div>
            </div>
        )}
        </>
        
    );
};

export default Navbar;
