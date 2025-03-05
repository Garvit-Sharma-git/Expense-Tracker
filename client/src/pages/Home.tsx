import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Form from '../components/form'
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cards from './Cards.tsx';
// import Groups from './Groups.tsx'
// import Dashboard from './Dashboard.tsx'

const Home: React.FC = () => {
    // const HomeLayout: React.FC = () => {
    //     return (
    //         <>
    //             <Home /> {/* Keeps Home as the main layout */}
    //             <Outlet /> {/* Renders child routes */}
    //         </>
    //     );
    // };
    return(
        <>
        <Navbar /> 
        <Outlet /> 
        {/* <Form />  */}
        {/* <Outlet/> */}
        
        
        </>
        
    )
}

export default Home;