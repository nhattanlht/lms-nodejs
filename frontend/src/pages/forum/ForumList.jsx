import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { IoIosArrowBack } from "react-icons/io";
import Forum from "./Forum";
import { useParams, useNavigate } from "react-router-dom";
import { server } from "../../main";
import "./forumlist.css";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
const ForumsList = ({ user }) => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.id;
  const [courseTitle, setCourseTitle] = useState("");
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchForums();
  }, [courseId]);

  const backToCourseHandler = () => {
    navigate(`/course/study/${courseId}`);
  };

  const fetchForums = async () => {
    try {
      setLoading(true);
      const {data} = await axios.get(`${server}/api/forums/${courseId}`,
        {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
      );
      setForums(data.data);
      setCourseTitle(data.data[0].courseId.title);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch forums.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
    const { data } = await axios.post(`${server}/api/forums`,
       {
        title: newTitle,
        courseId: courseId,
    }, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    fetchForums();
    setNewTitle("");
    toast.success("Forum created successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Error creating question:", error);
    }finally {
      setIsCreating(false);
    }
};

  if (loading) return <Loading />;

  return (
    <div className="forums-list">
  {selectedForum ? (
    <Forum
      forum={selectedForum}
      backToForums={() => setSelectedForum(null)}
    />
  ) : (
    <div>
      <h2 className="forums-header">Forums for {courseTitle}</h2>
      <button className="back-button" onClick={backToCourseHandler}>
        <IoIosArrowBack />
        Back to Course
      </button>
      {forums.length === 0 && (
        <p className="no-forums-message">There isn't any forum yet</p>
      )}
      <div className="forum-cards-container">
        {forums.map((forum) => (
          <div
            className="forum-card"
            key={forum._id}
            onClick={() => setSelectedForum(forum)}
          >
            <h3 className="forum-title">{forum.title}</h3>
            <div className="forum-meta">
              <span className="created-at">
                { moment(forum.createdAt).format("MMM Do, YYYY")}
              </span>
            </div>
          </div>
        ))}
      </div>
      <form className="create-question-form" onSubmit={handleCreateForum}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter a title..."
          required
        />
        {!isCreating &&<button className="post-button" type="submit">
          Create New Forum
        </button>}
        {isCreating && <button className="post-button" type="submit" disabled>
          Creating...
        </button>}
      </form>
    </div>
  )}
</div>

  );
};

export default ForumsList;
