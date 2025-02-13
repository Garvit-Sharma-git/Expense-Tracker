import React, { useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';


const CLIENT_ID = "485422164160-hd5sj3lqho898u3ik3rlqpel8nfntqan.apps.googleusercontent.com";

const Signup: React.FC = () => {

    const [formData, setFormData] = useState({ name: '', email: '', password: '',confirmpass:'' });
    const [error,setError]=useState('');

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if(formData.password !== formData.confirmpass){
            setError("Password Does not Match :(");
            //check karne ke liye
            console.log("password",formData.password,"and confirm password",formData.confirmpass)
            return;
        }
        setError('');

        try {
            const response = await axios.post('http://localhost:5001/api/auth/signup', formData);
            alert(response.data.message);
            navigate('/login');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Something went wrong');
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const { credential } = credentialResponse;
        console.log("yo ");
        
        try {
            const response = await axios.post('http://localhost:5001/api/auth/google', { credential });
            alert(response.data.message);
            console.log(response)
        } catch (err: any) {
            alert(err.response?.data?.error || 'Google Sign-In failed.');
        }
    };

    const handleGoogleError = () => {
        alert('Google Sign-In failed. Please try again.');
    };

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            
            
            <div className="flex min-h-full  flex-1 flex-col justify-center px-6 py-12 lg:px-8 grid grid-cols-2">
                
                {/* photo wala div */}
                <div className='bg-black rounded-lg'>
                <img
                    alt="Your Company"
                    src="./src/assets/juntrax_logo.jpeg"
                    className="mx-auto h-700 w-700 mt-5"
                />
                
                </div>

                {/* signup wala div */}
                <div className='border  border-gray-300 rounded-lg  '>

                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        {/* <img
                            alt="Your Company"
                            src="./src/assets/juntrax_logo.jpeg"
                            className="mx-auto h-10 w-auto mt-5"
                        /> */}
                        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                            Sign up here!
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto  sm:w-full sm:max-w-sm">
                    
                        <form action="#" method="POST" className="space-y-6">

                            {/* username wala div */}
                            <div>
                                <label htmlFor="email" className="block font-extrabold text-sm/6 font-medium text-gray-900">
                                    Username
                                </label>
                                <div className="mt-2">
                                    <input
                                    id="name"
                                    name="name"
                                    type="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>


                            {/* email wala div */}
                            <div>
                                <label htmlFor="email" className="block font-extrabold text-sm/6 font-medium text-gray-900">
                                    Email 
                                </label>
                                <div className="mt-2">
                                    <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            {/* password and confirmpassword wala div */}
                            <div>
                                {/* password wala div */}
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block font-extrabold text-sm/6 font-medium text-gray-900">
                                    Password
                                    </label>
                                    {/* <div className="text-sm">
                                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </a>
                                    </div> */}
                                    
                                </div>
                                <div className="mt-2">
                                    <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>

                                {/* confirmpasswrod wala div */}
                                <label htmlFor="confirmpass" className="block mt-1 mb-1 text-sm/6 font-medium text-gray-900">
                                    Confirm Password
                                    </label>
                                <div className="mt-2">
                                    <input
                                    id="confirmpass"
                                    name="confirmpass"
                                    type="password"
                                    value={formData.confirmpass}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            
                            {error && ( //error dikhaega agar password match nahi hua to
                                        <p className="text-red-500 text-sm mt-2">{error}</p>
                                    )}


                            <div>
                                <button
                                    onClick={handleSubmit}
                                    className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Sign up
                                </button>
                            </div>
                            <p className='text-black text-center'>---------------or--------------</p>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                containerProps={{
                                    className: "flex w-full justify-center ",
                                }}
                            />
                        </form>
                        

                        <p className="mt-10 text-center text-l/6 text-bold text-gray-500 mb-5">
                            Already a user?{' '}
                            <a href="./login" className="font-semibold text-black hover:text-gray-500">
                            log in
                            </a>
                        </p>
                    </div>

                </div>
                
            </div>


        </GoogleOAuthProvider>
            
        
        
    );
};

export default Signup;
