import React, { useEffect, useState } from "react";
import "./forum.css";
import axios from "axios";
import QuestionDetail from "./QuestionDetail";
import moment from "moment";
import { server } from "../../main";
import { IoIosArrowBack } from "react-icons/io";
import toast from "react-hot-toast";

const Forum = ({ forum, backToForums }) => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [newQuestion, setNewQuestion] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
        const { data } = await axios.get(`${server}/api/forums/${forum._id}/questions`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        
        setQuestions(data.data);
        console.log(data.data);
        } catch (error) {
        console.error("Error fetching questions:", error);
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
        const { data } = await axios.post(`${server}/api/forums/${forum._id}/questions`, {
            title: newTitle,
            content: newQuestion,
        },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          });
        
        setIsLoading(false);
        setNewQuestion("");
        setNewTitle("");
        fetchQuestions();
        toast.success("Question created successfully!");
        } catch (error) {
          toast.error("Error creating question:", error.response.data.message);
        }finally{
          setIsLoading(false);
        }
    };

    return (
      <div className="course-forum">
  {selectedQuestion ? (
    <QuestionDetail
      question={selectedQuestion}
      backToList={() => setSelectedQuestion(null)}
      forumId={forum._id}
    />
  ) : (
    <div>
      <button className="back-button" onClick={backToForums}>
        <IoIosArrowBack />
        Back to Forums
      </button>
      <h2 className="forum-header">{forum.title}</h2>
      {questions.length === 0 && <p>No questions yet. Be the first to ask!</p>}
      {questions.map((question) => (
        <div
          className="question-list-item"
          key={question._id}
          onClick={() => setSelectedQuestion(question)}
        >
          <h3 className="title">{question.title}</h3>
          <div className="username">{question.createdBy?.name || "Anonymous"}
          <span className="created-at"> • {moment(question.createdAt).startOf('hour').fromNow()}</span>
          </div>
          <p className="content">{question.question}</p>
        </div>
      ))}
      <form className="create-question-form" onSubmit={handleCreateQuestion}>
        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" />
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question..."
          required
        />
        <div className="post-button-container">
        {!isLoading &&<button className="post-button" type="submit">Create new question</button>}
        {isLoading && <button className="post-button" type="submit" disabled>Creating...</button>}
        </div>
      </form>
    </div>
  )}
</div>

    );
};

export default Forum;
