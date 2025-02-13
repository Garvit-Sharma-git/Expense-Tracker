import React, { useEffect } from "react";
import { useNavigate, useLocation, replace } from "react-router-dom";

interface RefreshHandlerProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const RefresherHandler: React.FC<RefreshHandlerProps> = ({
  setIsAuthenticated,
}) => {
  const Navigate = useNavigate();
  const Location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      Navigate("/login");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/auth/verify-token",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          setIsAuthenticated(false);
          Navigate("/login");
        } else {
          setIsAuthenticated(true);
          if (
            Location.pathname === "/login" ||
            Location.pathname === "/signup"
          ) {
            Navigate("/home");
          }

          console.log("chal rha h");
        }
      } catch (error) {
        console.log("error verifying token", error);
        setIsAuthenticated(false);
        Navigate("/login") || Navigate("/signup") || Navigate("/");
      }
    };
    verifyToken();

    // if(localStorage.getItem('token')){
    //     setIsAuthenticated(true);
    //     if(Location.pathname==='/login' || Location.pathname==='/signup'|| Location.pathname==='/'){
    //         Navigate('/home',{replace:false});
    //     }
    // }
  }, [Location, Navigate, setIsAuthenticated]);
  return null;
};

export default RefresherHandler;
