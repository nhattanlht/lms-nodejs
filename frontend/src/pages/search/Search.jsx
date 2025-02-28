import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import CourseCard from "../../components/coursecard/CourseCard";
import { server } from "../../main";

const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get("q");

    if (searchTerm) {
      fetchSearchResults(searchTerm);
    }
  }, [location]);

  const fetchSearchResults = async (searchTerm) => {
    try {
      const { data } = await axios.get(`${server}/api/course/one?name=${searchTerm}`);
      console.log(data);

      setSearchResults(data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  return (
      <div className="courses">
      <h2>Search Results</h2>
      <div className="course-container">
      {searchResults.length > 0 ? (
        <div className="course-container">
          {searchResults.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <p>No courses found.</p>
      )}
      </div>
      </div>
  );
};

export default Search;
