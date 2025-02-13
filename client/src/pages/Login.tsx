import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';


const Login: React.FC = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [ error,setError] = useState<string | null>(null);
 
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        try {
            const response = await axios.post('http://localhost:5001/api/auth/login', formData);
            localStorage.setItem('token',response.data.token)
            navigate('/home');
            alert('Login successful!');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Something went wrong');
        }
    };

    // const handleGoogleSuccess = async (credentialResponse: any) => {
    //     const { credential } = credentialResponse;
    //     try {
    //         const response = await axios.post('http://localhost:5001/api/auth/google', { credential });
    //         alert(response.data.message);
    //     } catch (err: any) {
    //         alert(err.response?.data?.error || 'Google Sign-In failed.');
    //     }
    // };

    // const handleGoogleError = () => {
    //     alert('Google Sign-In failed. Please try again.');
    // };

    
    return (
        <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div className='log bg-17153B' >
      <div className="border border-gray-400 bg-gray-100 rounded-lg flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* <img
            alt="Your Company"
            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          /> */}
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
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

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-black hover:text-gray-500">
                    Forgot password?
                  </a>
                </div>
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
            </div>

            <div>
              <button
                onClick={handleSubmit}
                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Sign in
              </button>
            </div>
            <p className='text-black text-center'>---------------or--------------</p>
            {/* <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                containerProps={{
                className: "flex w-full justify-center ",
                                }}
            /> */}
            
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <a href="./signup" className="font-semibold text-black hover:text-gray-500">
              Signup
            </a>
          </p>
        </div>
      </div>

      </div>
      
    </>
    );
};

export default Login;
