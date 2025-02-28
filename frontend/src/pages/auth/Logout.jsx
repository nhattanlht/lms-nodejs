// Purpose: Logout page for the user to logout of the system.
import React, { useEffect, useContext } from "react";
import "./auth.css";
import { useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";

const Logout = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserData);

  useEffect(() => {
    fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include', // If using cookies
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Logged out successfully') {
          // Clear user data in context
          setUser(null);
          // Redirect to login page
          navigate('/login');
        }
      });
  }, [navigate, setUser]);

  return null;
};

export default Logout;