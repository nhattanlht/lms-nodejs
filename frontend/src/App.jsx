import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Footer from "./components/footer/Footer";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import { UserData } from "./context/UserContext";
import Loading from "./components/loading/Loading";
import Courses from "./pages/courses/Courses";
import Dashbord from "./pages/dashbord/Dashbord";
import CourseStudy from "./pages/coursestudy/CourseStudy";
import CourseNotStudy from "./pages/coursenotstudy/CourseNotStudy";
import Search from "./pages/search/Search";
import Noti from "./pages/notification/Noti";

import Lecture from "./pages/lecture/Lecture";
import AdminDashbord from "./admin/Dashboard/AdminDashbord";
import AdminCourses from "./admin/Courses/AdminCourses";
import AdminUsers from "./admin/Users/AdminUsers";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AssignmentDetails from "./pages/assignment/AssignmentDetails";

import Message from "./pages/message/message";
import ForumList from "./pages/forum/ForumList";
import { useState } from "react";

const App = () => {
  const { isAuth, user, loading } = UserData();
  const [receiverId, setReceiverId] = useState(null);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Header isAuth={isAuth} />
          <Routes>
            <Route
              path="/"
              element={isAuth ? <Dashbord user={user} /> : <Home />}
            />
            <Route path="/about" element={<About />} />
            <Route
              path="/account"
              element={isAuth ? <Account user={user} /> : <Login />}
            />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/register"
              element={isAuth ? <Home /> : <Register />}
            />
            <Route path="/verify" element={isAuth ? <Home /> : <Verify />} />
            <Route
              path="/forgot"
              element={isAuth ? <Home /> : <ForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={isAuth ? <Home /> : <ResetPassword />}
            />
           
            <Route
              path="/:id/dashboard"
              element={isAuth ? <Dashbord user={user} /> : <Login />}
            />

             <Route path="/courses" element={<Courses />} />

             <Route
              path="/course/:id/not-subscribed"
              //element={isAuth ? <CourseDescription user={user} /> : <Login />}
              element={<CourseNotStudy />}
            />
            
            <Route
              path="/course/study/:id"
              element={isAuth ? <CourseStudy user={user} /> : <Login />}
              //element={ <CourseStudy /> }
            />
            <Route
              path="/course/study/:id/forums"
              element={isAuth ? <ForumList user={user} /> : <Login />}
            />
            <Route
              path="/lectures/:id"
              element={isAuth ? <Lecture user={user} /> : <Login />}
            />

          
            <Route path="/search" element={<Search />} />
            
            <Route 
              path="/notification" 
              element={isAuth ? <Noti user={user} /> : <Login />}
            />

            <Route
              path="/admin/dashboard"
              element={isAuth ? <AdminDashbord user={user} /> : <Login />}
            />

            <Route
              path="/admin/course"
               element={isAuth ? <AdminCourses user={user} /> : <Login />}
            />
           
            <Route
              path="/admin/users"
              element={isAuth ? <AdminUsers user={user} /> : <Login />}
            />
            
            <Route
              path="/assignments/details/:assignmentId"
              element={isAuth ? <AssignmentDetails user={user} /> : <Login />}
            />
            <Route
              path="/messages"
              element={isAuth ? <Message user={user} receiverId={receiverId} setReceiverId={setReceiverId} /> : <Login />}
            />
          </Routes>
          <Footer />
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
