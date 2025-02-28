import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import { CourseContextProvider } from "./context/CourseContext.jsx";
import { AssignmentContextProvider } from "./context/AssignmentContext.jsx";
import { SubmissionsContextProvider } from "./context/SubmissionsContext";

export const server = import.meta.env.VITE_SERVER_URL;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserContextProvider>
      <CourseContextProvider>
        <AssignmentContextProvider>
          <SubmissionsContextProvider>
            <App />
          </SubmissionsContextProvider>
        </AssignmentContextProvider>
      </CourseContextProvider>
    </UserContextProvider>
  </React.StrictMode>
);
