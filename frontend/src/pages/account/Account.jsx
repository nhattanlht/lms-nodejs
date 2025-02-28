import React, { useState, useEffect } from "react";
import { MdDashboard } from "react-icons/md";
import "./account.css";
import { IoMdLogOut } from "react-icons/io";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
  };

  const [profileData, setProfileData] = useState({
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    email: user.email,
    phoneNumber: user.profile.phoneNumber || "",
    dateOfBirth: user.profile.dateOfBirth || "",
    gender: user.profile.gender || "",
    address: user.profile.address || "",
    levelEducation: user.profile.levelEducation || "",
    typeEducation: user.profile.typeEducation || "",
    faculty: user.profile.faculty || "",
  });

  useEffect(() => {
    // If the user data changes, update the form data
    setProfileData({
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      email: user.email,
      phoneNumber: user.profile.phoneNumber || "",
      dateOfBirth: user.profile.dateOfBirth || "",
      gender: user.profile.gender || "",
      address: user.profile.address || "",
      levelEducation: user.profile.levelEducation || "",
      typeEducation: user.profile.typeEducation || "",
      faculty: user.profile.faculty || "",
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.put(`${server}/api/user/me`, profileData, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await response.data;
      if (data.user) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  
  return (
    <div>
  {user && (
    <div className="profile">
      <h2>Profile Information</h2>
      <form>
        <div className="form-row">
          <label>
            <strong>First Name</strong>
          </label>
          <input
            type="text"
            name="firstName"
            value={profileData.firstName}
            onChange={handleInputChange}
            placeholder="John"
          />
        </div>

        <div className="form-row">
          <label>
            <strong>Last Name</strong>
          </label>
          <input
            type="text"
            name="lastName"
            value={profileData.lastName}
            onChange={handleInputChange}
            placeholder="Doe"
          />
        </div>

        <div className="form-row">
          <label>
            <strong>Email</strong>
          </label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            disabled
            placeholder="example@student.com"
          />
        </div>

        <div className="form-row">
          <label>
            <strong>Phone Number</strong>
          </label>
          <input
            type="text"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleInputChange}
            placeholder="0123456789"
          />
        </div>

        <div className="form-row">
          <label>
            <strong>Date of Birth</strong>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={profileData.dateOfBirth}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <label>
            <strong>Gender</strong>
          </label>
          <select id="gender" name="gender" onChange={handleInputChange} value={profileData.gender}>
            <option value="">--Please choose an option--</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-row">
          <label>
            <strong>Address</strong>
          </label>
          <input
            type="text"
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            placeholder="Ho Chi Minh City"
          />
        </div>

        {user.role === "student" && (
          <>
            <div className="form-row">
              <label>
                <strong>Level of Education</strong>
              </label>
              <input
                type="text"
                name="levelEducation"
                value={profileData.levelEducation}
                onChange={handleInputChange}
                placeholder="Bachelor"
              />
            </div>

            <div className="form-row">
              <label>
                <strong>Type of Education</strong>
              </label>
              <input
                type="text"
                name="typeEducation"
                value={profileData.typeEducation}
                onChange={handleInputChange}
                placeholder="Full-time"
              />
            </div>
          </>
        )}

        {user.role === "lecturer" && (
          <div className="form-row">
            <label>
              <strong>Faculty</strong>
            </label>
            <input
              type="text"
              name="faculty"
              value={profileData.faculty}
              onChange={handleInputChange}
              placeholder="Information Technology"
            />
          </div>
        )}

        <div className="form-submit">
          <button
            onClick={handleSubmit}
            className="update-btn account-btn"
          >
            Update Profile
          </button>
        </div>
      </form>

      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <button
          onClick={() => navigate(`/${user._id}/dashboard`)}
          className="common-btn account-btn"
        >
          <MdDashboard />
          Dashboard
        </button>

        {user.mainrole === "admin"&& (
          <button
            onClick={() => navigate(`/admin/dashboard`)}
            className="common-btn account-btn"
          >
            <MdDashboard />
            Admin Dashboard
          </button>
        )}

        <button
          onClick={logoutHandler}
          className="logout-btn account-btn"
        >
          <IoMdLogOut />
          Logout
        </button>
      </div>
    </div>
  )}
</div>

  );
};

export default Account;
