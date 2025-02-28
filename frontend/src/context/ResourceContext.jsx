import { createContext, useContext, useState } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";

const ResourceContext = createContext();

export const ResourceContextProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [resource, setResource] = useState(null);
  const [courses, setCourses] = useState([]);

  const fetchResourcesByCourse = async (courseId) => {
    try {
      const { data } = await axios.get(`${server}/api/resource/${courseId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setResources(data.resources);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchResourceDetails = async (resourceId) => {
    try {
      const { data } = await axios.get(`${server}/api/resource/details/${resourceId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setResource(data.resource);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${server}/api/courses`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setCourses(data.courses);
    } catch (error) {
      console.log(error);
    }
  };

  const addResource = async (formData, navigate) => {
    try {
      const { data } = await axios.post(`${server}/api/resource`, formData, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      navigate("/resources");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const updateResource = async (resourceId, updatedResource) => {
    try {
      const { data } = await axios.put(`${server}/api/resource/${resourceId}`, updatedResource, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      setResource(data.resource);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      const { data } = await axios.delete(`${server}/api/resource/${resourceId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      setResources(resources.filter((resource) => resource._id !== resourceId));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <ResourceContext.Provider
      value={{
        resources,
        resource,
        courses,
        fetchResourcesByCourse,
        fetchResourceDetails,
        fetchCourses,
        addResource,
        updateResource,
        deleteResource,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export const ResourceData = () => useContext(ResourceContext);
