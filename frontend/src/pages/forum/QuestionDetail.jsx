import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../main";
import "./questionDetail.css";
import moment from "moment";
import { IoIosArrowBack, IoIosSend } from "react-icons/io";
const QuestionDetail = ({ question, backToList, forumId }) => {
  const [answers, setAnswers] = useState([]);
  const [answerContent, setAnswerContent] = useState("");

  useEffect(() => {
    fetchAnswers();
  }, []);

  const fetchAnswers = async () => {
    try {
      const { data } = await axios.get(`${server}/api/forums/${forumId}/questions/${question._id}/answers`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      console.log(data);
      setAnswers(data.data);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${server}/api/forums/${forumId}/questions/${question._id}/answers`, {
        content: answerContent,
      },
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAnswerContent("");
      setAnswers((prev) => [...prev, { content: answerContent }]);
    } catch (error) {
      console.error("Error adding answer:", error);
    }
  };

  if (!question) return <p>Loading...</p>;

  return (
    <div className="question-detail">
  <button className="back-button" onClick={backToList}>
    <IoIosArrowBack/>
    Back to questions
  </button>
  <h2 className="forum-header">{question.title}</h2>
  <div className="question-container">
  <div className="question-card">
    <div className="username">{question.createdBy?.name || "Anonymous"}
    </div>
    <p className="content">{question.content}</p>
    <span className="created-at"> {moment(question.createdAt).format('hh:mm a • MMM Do, YYYY, ')}</span>
  </div>
  {answers.length !== 0 && <ul className="answers-list">
    {answers.map((answer, index) => (
      <li className="answer-card" key={index}>
        <div className="username">{answer.createdBy?.name || "Anonymous"} 
        <span className="created-at"> • {moment(question.createdAt).format('MMM Do YYYY, hh:mm')}</span>
        </div>
        <p className="content">{answer.content}</p>
      </li>
    ))}
  </ul>}
  <form className="add-answer-form" onSubmit={handleAddAnswer}>
    <textarea
      value={answerContent}
      onChange={(e) => setAnswerContent(e.target.value)}
      placeholder="Write your answer..."
      required
    />
    <div className="post-button-container">
    <button className="post-button" type="submit"><IoIosSend/></button>
    </div>
  </form>
  </div>
</div>


  );
};

export default QuestionDetail;
