import React, { useState, useEffect } from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import { FaBell } from "react-icons/fa";  // Import Bell Icon
import axios from "axios";
import { MdMail } from "react-icons/md"; // Import Mail Icon from React Icons

import { faSearch, faTimes, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import io from 'socket.io-client';

const userId = localStorage.getItem('userId'); // Giả sử bạn lưu userId trong localStorage sau khi đăng nhập

if (!userId) {
  console.error('User is not logged in!');
}

const server = import.meta.env.VITE_SERVER_URL;

const socket = io(server, {
  query: { userId }, // Truyền userId thực tế vào query của Socket.IO
});
const Header = ({ isAuth }) => {
  const { user, setIsAuth, setUser } = UserData();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
  };

  const showNotificationDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    let filteredResults = [];

    try {
      const { data } = await axios.get(`${server}/api/course/all`);
      if (data.courses && typeof data.courses === "object") {
        const coursesArray = Object.values(data.courses);

        const filteredResults = coursesArray.filter((course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSearchResults(filteredResults);

        navigate(`/search?q=${searchTerm}`, { state: { results: filteredResults } });
      } else {
        toast.error("Invalid data format: courses is not an object.");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses. Try again!");
    }
  };

  const getNotifications = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${server}/api/notification/me`, {
        headers: { 'token': token },
      });

      if (response.data.notifications) {
        setNotifications(response.data.notifications);
        setUnreadNotifications(response.data.unread);
      } else {
        toast.error("Failed to fetch notifications.");
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      socket.on('newNotification', (notification) => {
        if(notification.recipients.includes(user._id)){
          setNotifications((prevNotifications) => [notification, ...prevNotifications]);
          console.log('New notification:', notification);
          setUnreadNotifications((prevUnread) => prevUnread + 1);
        }
      });

      getNotifications();
      return () => socket.off("newNotification"); // Cleanup listener
    }
  }, [isAuth]);

  // Hàm xử lý khi nhấn vào thông báo
  const handleNotificationClick = () => {
    navigate('/notification'); // Dẫn đến trang /notification khi nhấn vào thông báo
  };

  const isRead = (notification) => {
    const readBy = notification.readBy.map((id) => id.toString());
    return readBy.includes(user._id) || notification.sender === user._id;
  };

  return (
    <header className="header">
      <div className="mobile-adjustment">
        <Link to="/" className="logo">LMS </Link>

        <button className="menu-toggle" onClick={toggleMenu}>
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>
      </div>
      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        {user?.mainrole === "admin" && <Link to="/admin/dashboard">Dashboard</Link>}
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/about">About</Link>
      </nav>

      <div className={`header-actions ${menuOpen ? "open" : ""}`}>

        <div className="search-bar">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
        </div>


      </div>

      {isAuth ? (
        <div className="user-action">
          <div className="noti">
            <div className="noti-icon" onClick={showNotificationDropdown} >
            <FaBell className="notification-icon" />
            {(unreadNotifications > 0) &&<div className="unread-notifications">{unreadNotifications}</div>}
            </div>
            {showDropdown && (
              <div className="notification-dropdown">
                {loading ? (
                  <div>Loading...</div>
                ) : notifications.length === 0 ? (
                  <div>No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`item ${isRead(notification) ? 'read' : ''}`}
                      onClick={handleNotificationClick} // Khi nhấn vào thông báo
                    >
                      <MdMail className="iconM" />
                      {notification.subject}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="dropdown">
            <span className="dropdown-button" onClick={toggleDropdown}>
              {user?.profile?.firstName || "User"} ▾
            </span>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/account" className="dropdown-item">Account</Link>
                <Link to="/messages" className="dropdown-item">Messages</Link>
                <span onClick={logoutHandler} className="dropdown-item">Logout</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link to="/login" className="login-link">Login</Link>
      )}
    </header>
  );
};

export default Header;
