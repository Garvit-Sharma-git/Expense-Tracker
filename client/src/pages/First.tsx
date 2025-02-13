import React from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const First:React.FC=()=>{
    const navigate = useNavigate();
    const handleNavigation = () => {
        navigate('/login');
    };
    return(
        <>
        
            <section>
                <div>
                    <div className='bg-repeat text-black'>
                        <img src="./src/assets/space.webp" alt="Background" className='absolute inset-0 h-full w-full object-cover' />
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        
                        
                        <div className=" absolute bottom-6 left-6 text-white">
                            <h1 className="text-4xl font-bold mb-2">Income & Expense Tracker</h1>
                            <p className="text-lg mb-4"></p>
                        
                            
                            
                            <button
                                onClick={handleNavigation}
                                className="px-6 py-3 bg-black rounded-md hover:bg-gray-600">
                                Get Started
                            </button>
                        </div>

                    </div>
                </div>
            </section>
            
        </>
    )
}

export default First;