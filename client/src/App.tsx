import React, { useState , useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate , Outlet, useLocation} from 'react-router-dom';
import Signup from './pages/Signup.tsx';
import Login from './pages/Login';
import Home from './pages/Home.tsx';
import Cards from './pages/Cards.tsx';
import Groups from './pages/Groups.tsx'
import Dashboard from './pages/Dashboard.tsx'
import First from './pages/First.tsx'
import './App.css'
// import ProtectedRoute from './components/ProtectedRoute.tsx';
import RefresherHandler from './components/RefreshHandler.tsx';
import Form from './components/form.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/footer.tsx';


interface ProtectedRouteProps{
    element: JSX.Element;
    isAuthenticated:boolean
}

const HomeLayout: React.FC = () => {
    return (
        <>
            <Navbar /> 
            <Outlet /> 
            <Form />
            <Footer/>
        </>
    );
};


const PrivateRoute:React.FC<ProtectedRouteProps>=({isAuthenticated,element})=>{
    // const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? element : <Navigate to="/home"/>
}

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // const location = useLocation();

    const PrivateRoute:React.FC<ProtectedRouteProps>=({element})=>{
        // const isAuthenticated = localStorage.getItem('token');
        return isAuthenticated ? element : <Navigate to="/home"/>
    }

   

    return (
        <div>
        {/* <Router> */}
            <RefresherHandler setIsAuthenticated={setIsAuthenticated} />
            <Routes>
                <Route path="/" element={<First/>} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                {/* <Route path="/home/*" element={<PrivateRoute element={<Home/>} />} /> */}
                {/* <Route path="/home/*" element={< PrivateRoute element={<Home/>} />} /> */}

                <Route path="/home" >
                    <Route index element={<HomeLayout />}  />

                    <Route path="form" element={<Form />} />
                    <Route path="transactions" element={<Cards />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="dashboard" element={<Dashboard />} />
                </Route>

                {/* <Route path="/home" element={<Home />} /> */}
                {/* <Route path="/transactions" element={<Cards />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/dashboard" element={<Dashboard />} /> */}



                <Route path="*" element={<h1 className='text-black mt-10 text-2xl/9 font-bold  justify-center text-center'>404 - Page Not Found Dude!</h1>} />
            </Routes>
        {/* </Router> */}
        </div>
    );
};

export default App;