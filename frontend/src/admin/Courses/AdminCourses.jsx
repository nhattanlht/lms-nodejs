import React, { useState, useEffect } from "react";
import Layout from "../Utils/Layout";
import { useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import "./admincourses.css";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const AdminCourses = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.mainrole !== "admin") return navigate("/");

  const { courses, fetchCourses, participants, fetchParticipants } = CourseData();

  const [showCourses, setShowCourses] = useState(courses);

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [addedParticipants, setAddedParticipants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [search, setSearch] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  
  async function fetchUsers() {
    try {
      const { data } = await axios.get(`${server}/api/users`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
      fetchUsers();
    }, []);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedCourses.length > 0 && confirm("Are you sure you want to delete these courses?")) {
      deleteCourses(selectedCourses);
      setSelectedCourses([]);
    }
  };

  const deleteCourses = async (courseIds) => {
    try {
      const {data} = await axios.delete(`${server}/api/course`, 
        {
        headers: {
          token: localStorage.getItem("token"),
        },
        data: {
          ids: courseIds,
        }
      });

      toast.success(data.message);
      await fetchCourses();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleEditCourse = (course) => {
    setEditCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setSummary(course.summary || "");
    setStartDate(course.startDate ? moment(course.startDate).format("yyyy-MM-DD") : "");
    setEndDate(course.endDate ? moment(course.endDate).format("yyyy-MM-DD") : "");
    setImage(null);
    setImagePrev(course.image || null);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditCourse(null);
    setTitle("");
    setDescription("");
    setSummary("");
    setStartDate("");
    setEndDate("");
    setImage(null);
    setImagePrev(null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("summary", summary);
    myForm.append("startDate", startDate);
    myForm.append("endDate", endDate);
    myForm.append("file", image);
    try {
      if(!editCourse) {

        const { data } = await axios.post(`${server}/api/course/new`, myForm, {
        headers: {
          token: localStorage.getItem("token"),
        },
        });
      
        toast.success(data.message);
      }else{

        const { data } = await axios.put(`${server}/api/course/data/${editCourse._id}`, myForm, {
        headers: {
          token: localStorage.getItem("token"),
        },
        });

        toast.success(data.message);
      }
      
      setBtnLoading(false);
      await fetchCourses();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const findCourseByName = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(`${server}/api/course/one?name=${search}`);

      setShowCourses(data.courses);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleAddUsers = async() => {
    if (selectedCourse && (addedParticipants.length > 0)) {
      try{
        const {data} = await axios.post(`${server}/api/course/add/participants`, 
          {
            courseId: selectedCourse._id,
            participantsId: addedParticipants.map((user) => user._id),
          },
          {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        setSelectedCourse(null);
        setAddedParticipants([]);
        setBtnLoading(false);
      }catch(error){
        console.log(error);
        toast.error(error.response.data.message);
        setBtnLoading(false);
      }
    }
  };
  
  return (
    <Layout>
      <div className="admin-courses">
        <div className="top-bar">
          <button
            onClick={() => {
              resetForm();
              setShowForm((prev) => !prev);
            }}
            className="add-button"
          >
            {showForm ? "Cancel" : "Add Course"}
          </button>
          <div className="search-bar">
            <form onSubmit={findCourseByName}>
              <input 
              type="text" 
              placeholder="Search Course" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>
          </div>

          {(selectedCourses.length > 0 && user.role === "superadmin") && (
            <button onClick={handleDeleteSelected} className="delete-button">
              Delete Selected
            </button>
          )}
        </div>

        {showForm && (
          <div className="course-form">
            <h2>{editCourse ? "Edit Course" : "Add Course"}</h2>
            <form onSubmit={submitHandler}>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label htmlFor="description">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label htmlFor="summary">Summary</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />

              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />

              <label htmlFor="image">Image</label>
              <input type="file" onChange={changeImageHandler} />
              {imagePrev && <img src={imagePrev} alt="" width={300} />}

              {!btnLoading && <button type="submit" className="common-btn">
                {editCourse ? "Update Course" : "Add Course"}
              </button>}
              {btnLoading && <button type="submit" className="common-btn" disabled>
                {editCourse ? "Updating Course..." : "Adding Course..."}
              </button>
              }
            </form>
          </div>
        )}

        {(!showForm && !selectedCourse) && (<div className="course-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedCourses(
                        e.target.checked ? courses.map((c) => c._id) : []
                      )
                    }
                    checked={
                      selectedCourses.length > 0 &&
                      selectedCourses.length === courses.length
                    }
                  />
                </th>
                <th>Title</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showCourses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => toggleCourseSelection(course._id)}
                    />
                  </td>
                  <td onClick={() => handleEditCourse(course)}>{course.title}</td>
                  <td onClick={() => handleEditCourse(course)}>
                    {course.startDate &&
                      new Date(course.startDate).toLocaleDateString("en-GB", {
                        timeZone: "UTC",
                      })}
                  </td>
                  <td onClick={() => handleEditCourse(course)}>
                    {course.endDate &&
                      new Date(course.endDate).toLocaleDateString("en-GB", {
                        timeZone: "UTC",
                      })}
                  </td>
                  <td onClick={() => handleEditCourse(course)}>{course.createdBy}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => 
                      {
                        setSelectedCourse(course);
                        fetchParticipants(course._id);
                        }
                      }
                    >
                      Manage Users
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {(selectedCourse && !showForm) && (
          <div className="course-user-management">
            <h2>Manage Users for {selectedCourse.title}</h2>
            <div>
              <h3>Current Users</h3>
              <div className="user-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                    <tr key={participant.participant_id._id}>
                      <td>{participant.participant_id.name}</td>
                      <td>{participant.participant_id.email}</td>
                      <td>{participant.role}</td>
                    </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3>Add Users</h3>
              <input
                type="text"
                placeholder="Search users..."
                onChange={(e) =>
                  setFilteredUsers(
                    users.filter((user) =>
                      user.name
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase())
                    )
                  )
                }
              />
              <div className="user-table">
                <table>
                  <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                      <input
                        type="checkbox"
                        value={user._id}
                        checked={addedParticipants.includes(user)}
                        onChange={(e) =>
                          setAddedParticipants((prev) => 
                            prev.includes(user)
                              ? prev.filter((u) => u._id !== user._id)
                              : [...prev, user]
                        )}
                      />
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleAddUsers}>Add to Course</button>
              <button onClick={() => setSelectedCourse(null)}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};


export default AdminCourses;
