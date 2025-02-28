import React, { useEffect, useState } from "react";
import "./users.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { CourseData } from "../../context/CourseContext";
// import { set } from "mongoose";

const AdminUsers = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "superadmin") return navigate("/admin/dashboard");

  const { courses } = CourseData();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showUsers, setShowUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    levelEducation: "",
    typeEducation: "",
    faculty: "",
    role: "",
    mainrole: "user",
  });
  const [btnLoading, setBtnLoading] = useState(false);

  async function fetchUsers() {
    try {
      const { data } = await axios.get(`${server}/api/users`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setUsers(data.users);
      setShowUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.length > 0 && confirm("Are you sure you want to delete these users?")) {
      deleteUsers(selectedUsers);
      setSelectedUsers([]);
    }
  };

  const deleteUsers = async (users) => {
    try{
      const {data} = await axios.delete(`${server}/api/user`, {
        headers: {
          token: localStorage.getItem("token"),
        },
        data: {
          ids: users,
        },
      });

      toast.success(data.message);
      fetchUsers();
    }catch(error){
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setUserData({
      name: user.name,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      email: user.email,
      phoneNumber: user.profile.phoneNumber || "",
      dateOfBirth: moment(user.profile.dateOfBirth).format("yyyy-MM-DD") || "",
      gender: user.profile.gender || "",
      address: user.profile.address || "",
      levelEducation: user.profile.levelEducation || "",
      typeEducation: user.profile.typeEducation || "",
      faculty: user.profile.faculty || "",
      role: user.role,
      mainrole: user.mainrole,
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditUser(null);
    setUserData({
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      levelEducation: "",
      typeEducation: "",
      faculty: "",
      role: "",
      mainrole: "user",
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      if (!editUser) {

        const { data } = await axios.post(`${server}/api/user/new`, userData, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
      } else {

        const {data} = await axios.put(`${server}/api/user/data/${editUser._id}`, userData, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
      }

      setBtnLoading(false);
      await fetchUsers();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const updateRole = async (id) => {
    if (confirm("are you sure you want to update this user role")) {
      try {
        const { data } = await axios.put(
          `${server}/api/user/${id}`,
          {},
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        toast.success(data.message);
        fetchUsers();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const findUserByName = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(`${server}/api/users/many?name=${search}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      console.log(data);
      setShowUsers(data.users);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleAssignToCourse = async() => {
    if (selectedCourse) {
      try{
        const {data} = await axios.post(`${server}/api/course/add/participants`, 
          {
            courseId: selectedCourse,
            participantsId: selectedUsers,
          },
          {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        setSelectedCourse("");
        setSelectedUsers([]);
        setShowAssignModal(false);
      }catch(error){
        console.log(error);
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <Layout>
      <div className="user-table-container">
        <div className="top-bar">
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="add-button"
          >
            {showForm ? "Cancel" : "Add User"}
          </button>


          {selectedUsers.length > 0 && (
            <button onClick={() => { setShowAssignModal(true) }} className="add-button">
              Add to Course
            </button>
          )}

          <div className="search-bar">
            <form onSubmit={findUserByName}>
              <input
                type="text"
                placeholder="Search User"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>
          </div>

          {(selectedUsers.length > 0 && user.role === "superadmin") && (
            <button onClick={handleDeleteSelected} className="delete-button">
              Delete Users
            </button>
          )}
        </div>

        {showForm && (
          <div className="course-form">
            <h2>{editUser ? "Edit User" : "Add User"}</h2>
            <form onSubmit={submitHandler}>
              <label>Username</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="username"
              />

              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                placeholder="John"
              />

              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={editUser}
                placeholder="example@student.com"
              />

              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleInputChange}
                placeholder="0123456789"
              />

              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={userData.dateOfBirth}
                onChange={handleInputChange}
              />

              <label>Gender</label>
              <select id="gender" name="gender" onChange={handleInputChange} value={userData.gender}>
                <option value="">--Please choose an option--</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <label>Address</label>
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleInputChange}
                placeholder="Ho Chi Minh City"
              />

              <label>Main Role</label>
              <select id="mainrole" name="mainrole" onChange={handleInputChange} value={userData.mainrole} required>
                <option value="">--Please choose an option--</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>

              <label>Role</label>
              <select id="role" name="role" onChange={handleInputChange} value={userData.role} required>
                <option value="">--Please choose an option--</option>
                {userData.mainrole === "admin" && <option value="admin">Admin</option>}
                {userData.mainrole === "user" &&
                <>
                  <option value="lecturer">Lecturer</option>
                  <option value="student">Student</option>
                </>
                }
              </select>

              {userData.role === "student" && (
                <>
                  <label>Level of Education</label>
                  <input
                    type="text"
                    name="levelEducation"
                    value={userData.levelEducation}
                    onChange={handleInputChange}
                    placeholder="Bachelor"
                  />

                  <label>Type of Education</label>
                  <input
                    type="text"
                    name="typeEducation"
                    value={userData.typeEducation}
                    onChange={handleInputChange}
                    placeholder="Full-time"
                  />

                </>
              )}

              {userData.role === "lecturer" && (
                <>
                  <label>Faculty</label>
                  <input
                    type="text"
                    name="faculty"
                    value={userData.faculty}
                    onChange={handleInputChange}
                    placeholder="Information Technology"
                  />
                </>
              )}
              {!btnLoading && 
                <button type="submit" className="common-btn">
                  {editUser ? "Update User" : "Add User"}
                </button>
              }
              {btnLoading && 
                <button type="submit" className="common-btn" disabled>
                  {editUser ? "Updating User..." : "Adding User..."}
                </button>
              }
            </form>
          </div>
        )}

        {!showForm && (<div className="user-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedUsers(
                        e.target.checked ? users.map((u) => u._id) : []
                      )
                    }
                    checked={
                      selectedUsers.length > 0 &&
                      selectedUsers.length === users.length
                    }
                  />
                </th>
                <th>Name</th>
                <th>Fullname</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                    />
                  </td>
                  <td onClick={() => handleEditUser(user)}>{user.name}</td>
                  <td onClick={() => handleEditUser(user)}>{user.profile.firstName} {user.profile.lastName}</td>
                  <td onClick={() => handleEditUser(user)}>{user.email}</td>
                  <td onClick={() => handleEditUser(user)}>{user.role}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => updateRole(user._id)}
                    >
                      Update Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {showAssignModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Select a Course</h3>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <button onClick={handleAssignToCourse} disabled={!selectedCourse}>
                Assign
              </button>
              <button onClick={() => setShowAssignModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;
