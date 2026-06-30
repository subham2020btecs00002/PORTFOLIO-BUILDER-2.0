import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import "./PortfolioForm.css";
import { baseUrl } from '../url'
import { FaSpinner } from 'react-icons/fa'; // Import the spinner icon


const CreatePortfolio = () => {
  const { user } = useContext(AuthContext);
  const [portfolioExists, setPortfolioExists] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Debounced function to check if portfolio exists
    const checkPortfolioExists = debounce(async () => {
      try {
        const { data } = await axios.get(
          `${baseUrl}/api/portfolio/exists`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        setPortfolioExists(data.exists);
        if (data.exists) {
          navigate("/portfolio/edit");
        }
      } catch (err) {
        setPortfolioExists(false);
        console.error(err.response?.data || err.message);
      }
    }, 300);

    checkPortfolioExists();

    // Clean up function to cancel debounce
    return () => checkPortfolioExists.cancel();
  }, [navigate]);

  if (portfolioExists === null)
    return (
      <div className="spinner-container">
        <FaSpinner className="spinner-icon" />
      </div>
    );

  return portfolioExists ? null : (
    <div>
      <h2>Let's get Started</h2>
      <CreatePortfolioForm />
    </div>
  );
};

const CreatePortfolioForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projects: [{ title: "", description: "", link: "" }],
    education: [
      {
        collegeName: "",
        degree: "",
        branch: "",
        cgpaOrPercentage: "",
        yearOfJoining: "",
        yearOfPassing: "",
      },
    ],
    professionalHistory: [
      {
        companyName: "",
        position: "",
        responsibility: "",
        yearOfJoining: "",
        yearOfLeaving: "",
        isCurrentEmployee: false,
      },
    ],
    portfolioLinks: { github: "", leetcode: "", gfg: "" },
    pdf: null, // Add pdf to the form data state
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    projects: formData.projects.map(() => ({
      title: "",
      description: "",
      link: "",
    })),
    education: formData.education.map(() => ({
      collegeName: "",
      degree: "",
      branch: "",
      cgpaOrPercentage: "",
      yearOfJoining: "",
      yearOfPassing: "",
    })),
    professionalHistory: formData.professionalHistory.map(() => ({
      companyName: "",
      position: "",
      responsibility: "",
      yearOfJoining: "",
      yearOfLeaving: "",
    })),
    portfolioLinks: { github: "", leetcode: "", gfg: "" },
  });
  const nameValidator = /^[a-zA-Z\s]*$/;
  const [loading, setLoading] = useState(false); // Add loading state
  const [showModal, setShowModal] = useState(false);
  const [portfolioId, setPortfolioId] = useState(null);


  const validateEducationField = (name, value, index) => {
    let error = "";
    switch (name) {
      case "collegeName":
        if (!value.trim()) error = "College Name is required.";
        break;
      case "degree":
        if (!value) error = "Degree is required.";
        break;
      case "branch":
        if (!value) error = "Branch is required.";
        break;
      case "cgpaOrPercentage":
        if (!value.trim()) error = "CGPA or Percentage is required.";
        break;
      case "yearOfJoining":
        if (value === "") error = "Year of Joining is required.";
        break;
      case "yearOfPassing":
        if (!value.trim()) error = "Year of Passing is required.";
        break;
      default:
        break;
    }
    return error;
  };

  const validateProfessionalHistoryField = (name, value, index, formData) => {
    const professionalHistory = formData.professionalHistory[index];
    const { yearOfJoining, isCurrentEmployee } = professionalHistory;

    switch (name) {
      case "companyName":
        if (!value.trim()) return "Company name is required";
        return "";
      case "position":
        if (!value.trim()) return "Position is required";
        return "";
      case "responsibility":
        if (!value.trim()) return "Responsibility is required";
        else if (!pointWiseValidator.test(value)) {
          return "Responsibility must be in point-wise format, each point starting with a capital letter and ending with a period.";
        }
        return "";
      case "yearOfJoining":
        if (value === "") return "Year of joining is required";
        if (
          professionalHistory.yearOfLeaving &&
          new Date(value) >= new Date(professionalHistory.yearOfLeaving)
        ) {
          return "Year of joining must be before Year of leaving";
        }
        return "";
      case "yearOfLeaving":
        if (!isCurrentEmployee && value === "")
          return "Year of leaving is required";
        if (!isCurrentEmployee && new Date(value) <= new Date(yearOfJoining)) {
          return "Year of leaving must be after Year of joining";
        }
        return "";
      default:
        return "";
    }
  };

  const validateTitle = (title) => {
    if (title.trim() === "") {
      return "Title cannot be empty";
    } else if (title.length < 3) {
      return "Title must be at least 3 characters long";
    } else if (!nameValidator.test(title)) {
      return "Title cannot contain numbers";
    }
    return "";
  };
  // Regular expression to validate point-wise format
  const pointWiseValidator = /^[A-Z][^.!?]*\.\s*(?:[A-Z][^.!?]*\.\s*)*$/;

  const validateLink = (link) => {
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!link) return "Link is required";
    if (!urlPattern.test(link)) return "Invalid URL format";
    return "";
  };

  const validateDescription = (description) => {
    if (description.trim() === "") {
      return "Description cannot be empty";
    } else if (!pointWiseValidator.test(description)) {
      return "Description must be in point-wise format, each point starting with a capital letter and ending with a period.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      const error = validateTitle(value);
      setErrors({ ...errors, [name]: error });
    } else if (name === "description") {
      const error = validateDescription(value);
      setErrors({ ...errors, [name]: error });
    }

    setFormData({ ...formData, [name]: value });
  };
  const handleFileChange = (e) => {
    setFormData({ ...formData, pdf: e.target.files[0] });
  };

  const handleProjectChange = (e, index) => {
    const { name, value } = e.target;

    // Update the project data
    const updatedProjects = formData.projects.map((project, i) =>
      i === index ? { ...project, [name]: value } : project
    );
    setFormData({ ...formData, projects: updatedProjects });

    // Validate the updated field
    let error = "";
    if (name === "title") {
      error = validateTitle(value);
    } else if (name === "description") {
      error = validateDescription(value);
    } else if (name === "link") {
      error = validateLink(value);
    }

    // Update the error state
    const updatedProjectErrors = [...errors.projects];
    updatedProjectErrors[index] = {
      ...updatedProjectErrors[index],
      [name]: error,
    };
    setErrors({ ...errors, projects: updatedProjectErrors });
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    const updatedEducation = formData.education.map((edu, i) =>
      i === index ? { ...edu, [name]: value } : edu
    );

    const updatedErrors = errors.education.map((eduError, i) =>
      i === index
        ? { ...eduError, [name]: validateEducationField(name, value, index) }
        : eduError
    );

    setFormData({ ...formData, education: updatedEducation });
    setErrors({ ...errors, education: updatedErrors });

    // Additional validation for Year of Passing and Year of Joining
    if (name === "yearOfJoining" || name === "yearOfPassing") {
      const yearOfJoining =
        name === "yearOfJoining"
          ? value
          : updatedEducation[index].yearOfJoining;
      const yearOfPassing =
        name === "yearOfPassing"
          ? value
          : updatedEducation[index].yearOfPassing;

      if (
        yearOfPassing &&
        yearOfJoining &&
        new Date(yearOfPassing) <= new Date(yearOfJoining)
      ) {
        updatedErrors[index].yearOfPassing =
          "Year of Passing must be after Year of Joining.";
      } else {
        updatedErrors[index].yearOfPassing = "";
      }

      setErrors({ ...errors, education: updatedErrors });
    }
  };
  const handleEducationBlur = (e, index) => {
    const { name, value } = e.target;
    const updatedErrors = errors.education.map((eduError, i) =>
      i === index
        ? { ...eduError, [name]: validateEducationField(name, value) }
        : eduError
    );
    setErrors({ ...errors, education: updatedErrors });
  };

  const handleProfessionalHistoryChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const updatedHistory = formData.professionalHistory.map((history, i) =>
      i === index
        ? {
          ...history,
          [name]: type === "checkbox" ? checked : value,
        }
        : history
    );
    setFormData({ ...formData, professionalHistory: updatedHistory });

    // Validate the updated field
    const error = validateProfessionalHistoryField(
      name,
      value,
      index,
      formData
    );

    // Update the error state
    const updatedHistoryErrors = errors.professionalHistory.map(
      (historyError, i) =>
        i === index ? { ...historyError, [name]: error } : historyError
    );
    setErrors({ ...errors, professionalHistory: updatedHistoryErrors });
  };
  const addProject = () =>
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        { title: "", description: "", link: "" },
      ],
    });

  const removeProject = (index) =>
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          collegeName: "",
          degree: "",
          branch: "",
          cgpaOrPercentage: "",
          yearOfJoining: "",
          yearOfPassing: "",
        },
      ],
    });
    setErrors({
      ...errors,
      education: [
        ...errors.education,
        {
          collegeName: "",
          degree: "",
          branch: "",
          cgpaOrPercentage: "",
          yearOfJoining: "",
          yearOfPassing: "",
        },
      ],
    });
  };

  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
    setErrors({
      ...errors,
      education: errors.education.filter((_, i) => i !== index),
    });
  };

  const addProfessionalHistory = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      professionalHistory: [
        ...prevFormData.professionalHistory,
        {
          companyName: "",
          position: "",
          responsibility: "",
          yearOfJoining: "",
          yearOfLeaving: "",
          isCurrentEmployee: false,
        },
      ],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      professionalHistory: [
        ...prevErrors.professionalHistory,
        {
          companyName: "",
          position: "",
          responsibility: "",
          yearOfJoining: "",
          yearOfLeaving: "",
          isCurrentEmployee: false,
        },
      ],
    }));
  };

  const removeProfessionalHistory = (index) =>
    setFormData({
      ...formData,
      professionalHistory: formData.professionalHistory.filter(
        (_, i) => i !== index
      ),
    });

  const handlePortfolioLinksChange = (e) => {
    const { name, value } = e.target;
    const error = validateLink(value);

    setFormData({
      ...formData,
      portfolioLinks: {
        ...formData.portfolioLinks,
        [name]: value,
      },
    });

    setErrors({
      ...errors,
      portfolioLinks: {
        ...errors.portfolioLinks,
        [name]: error,
      },
    });
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Validate the form
    const isFormValid =
      !errors.title &&
      !errors.description &&
      formData.projects.every((project) =>
        !errors.projects[formData.projects.indexOf(project)].title &&
        !errors.projects[formData.projects.indexOf(project)].description &&
        !errors.projects[formData.projects.indexOf(project)].link
      ) &&
      formData.education.every((edu) =>
        !Object.values(errors.education[formData.education.indexOf(edu)]).some((error) => error)
      ) &&
      formData.professionalHistory.every((history) =>
        !Object.values(errors.professionalHistory[formData.professionalHistory.indexOf(history)]).some((error) => error)
      ) &&
      !Object.values(errors.portfolioLinks).some((error) => error);
  
    if (!isFormValid) {
      toast.error("Please fix the errors in the form before submitting.");
      setLoading(false);
      return;
    }
  
    try {
      const formattedData = new FormData();
      formattedData.append("title", formData.title);
      formattedData.append("description", formData.description);
      formattedData.append("pdf", formData.pdf); // Append the PDF file
  
      // Append projects
      formData.projects.forEach((project, index) => {
        formattedData.append(`projects[${index}][title]`, project.title);
        formattedData.append(`projects[${index}][description]`, project.description);
        formattedData.append(`projects[${index}][link]`, project.link);
      });
  
      // Append education
      formData.education.forEach((edu, index) => {
        formattedData.append(`education[${index}][collegeName]`, edu.collegeName);
        formattedData.append(`education[${index}][degree]`, edu.degree);
        formattedData.append(`education[${index}][branch]`, edu.branch);
        formattedData.append(`education[${index}][cgpaOrPercentage]`, edu.cgpaOrPercentage);
        formattedData.append(`education[${index}][yearOfJoining]`, edu.yearOfJoining ? new Date(edu.yearOfJoining).toISOString() : "");
        formattedData.append(`education[${index}][yearOfPassing]`, edu.yearOfPassing ? new Date(edu.yearOfPassing).toISOString() : "");
      });
  
      // Append professional history
      formData.professionalHistory.forEach((history, index) => {
        formattedData.append(`professionalHistory[${index}][companyName]`, history.companyName);
        formattedData.append(`professionalHistory[${index}][position]`, history.position);
        formattedData.append(`professionalHistory[${index}][responsibility]`, history.responsibility);
        formattedData.append(
          `professionalHistory[${index}][yearOfJoining]`,
          history.yearOfJoining ? new Date(history.yearOfJoining).toISOString() : ""
        );
        // Updated logic for yearOfLeaving
        formattedData.append(
          `professionalHistory[${index}][yearOfLeaving]`,
          history.isCurrentEmployee
            ? "1970-01-01T00:00:00.000+00:00"
            : history.yearOfLeaving
            ? new Date(history.yearOfLeaving).toISOString()
            : ""
        );
        formattedData.append(`professionalHistory[${index}][isCurrentEmployee]`, history.isCurrentEmployee);
      });
  
      // Append portfolio links
      Object.keys(formData.portfolioLinks).forEach((key) => {
        formattedData.append(`portfolioLinks[${key}]`, formData.portfolioLinks[key]);
      });
  
      // Make API request
      const response = await axios.post(`${baseUrl}/api/portfolio`, formattedData, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
  
      setPortfolioId(response.data.user);
      setShowModal(true);
      toast.success("Portfolio created successfully!", { containerId: "global" });
      navigate(`/portfolio/public/${response.data.user}`);
    } catch (err) {
      toast.error("Error creating portfolio");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="portfolio-form">
      <h2>Create Portfolio</h2>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? "input-error" : ""}
          required
        />
        {errors.title && <p className="error-message">{errors.title}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          value={formData.description}
          className={errors.description ? "input-error" : ""}
          onChange={handleChange}
        ></textarea>
        {errors.description && (
          <p className="error-message">{errors.description}</p>
        )}
      </div>
      <h3>Projects</h3>
      {formData.projects.map((project, index) => (
        <div key={index} className="project-group">
          <div className="form-group">
            <label htmlFor={`project-title-${index}`}>Project Title</label>
            <input
              type="text"
              name="title"
              id={`project-title-${index}`}
              value={project.title}
              onChange={(e) => handleProjectChange(e, index)}
              required
            />
            {errors.projects[index] && errors.projects[index].title && (
              <span className="error-message">
                {errors.projects[index].title}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`project-description-${index}`}>
              Project Description
            </label>
            <textarea
              name="description"
              id={`project-description-${index}`}
              value={project.description}
              onChange={(e) => handleProjectChange(e, index)}
            ></textarea>
            {errors.projects[index] && errors.projects[index].description && (
              <span className="error-message">
                {errors.projects[index].description}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`project-link-${index}`}>Project Link</label>
            <input
              type="text"
              name="link"
              id={`project-link-${index}`}
              value={project.link}
              onChange={(e) => handleProjectChange(e, index)}
            />
            {errors.projects[index] && errors.projects[index].link && (
              <span className="error-message">
                {errors.projects[index].link}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeProject(index)}
            className="remove-btn"
          >
            Remove Project
          </button>
        </div>
      ))}
      <button type="button" onClick={addProject} className="add-btn">
        Add Project
      </button>
      <h3>Education</h3>
      {formData.education.map((edu, index) => (
        <div key={index} className="education-group">
          <div className="form-group">
            <label htmlFor={`collegeName-${index}`}>College Name</label>
            <input
              type="text"
              name="collegeName"
              id={`collegeName-${index}`}
              value={edu.collegeName}
              onChange={(e) => handleEducationChange(e, index)}
              onBlur={(e) => handleEducationBlur(e, index)}
            />
            {errors.education[index].collegeName && (
              <span className="error-message">
                {errors.education[index].collegeName}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`degree-${index}`}>Degree</label>
            <select
              name="degree"
              id={`degree-${index}`}
              value={edu.degree}
              onChange={(e) => handleEducationChange(e, index)}
              onBlur={(e) => handleEducationBlur(e, index)}
            >
              <option value="">Select Degree</option>
              <option value="Btech">Btech</option>
              <option value="Mtech">Mtech</option>
              <option value="Diploma">Diploma</option>
            </select>
            {errors.education[index].degree && (
              <span className="error-message">
                {errors.education[index].degree}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`branch-${index}`}>Branch</label>
            <select
              name="branch"
              id={`branch-${index}`}
              value={edu.branch}
              onChange={(e) => handleEducationChange(e, index)}
              onBlur={(e) => handleEducationBlur(e, index)}
            >
              <option value="">Select Branch</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Mechanical Engineering">
                Mechanical Engineering
              </option>
              <option value="Electronics Engineering">
                Electronics Engineering
              </option>
              <option value="Electrical Engineering">
                Electrical Engineering
              </option>
            </select>
            {errors.education[index].branch && (
              <span className="error-message">
                {errors.education[index].branch}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`cgpaOrPercentage-${index}`}>
              CGPA or Percentage
            </label>
            <input
              type="text"
              name="cgpaOrPercentage"
              id={`cgpaOrPercentage-${index}`}
              value={edu.cgpaOrPercentage}
              onChange={(e) => handleEducationChange(e, index)}
              onBlur={(e) => handleEducationBlur(e, index)}
            />
            {errors.education[index].cgpaOrPercentage && (
              <span className="error-message">
                {errors.education[index].cgpaOrPercentage}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`yearOfJoining-${index}`}>Year of Joining</label>
            <input
              type="date"
              name="yearOfJoining"
              id={`yearOfJoining-${index}`}
              value={edu.yearOfJoining}
              onChange={(e) => handleEducationChange(e, index)}
            />
            {errors.education[index].yearOfJoining && (
              <span className="error-message">
                {errors.education[index].yearOfJoining}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`yearOfPassing-${index}`}>Year of Passing</label>
            <input
              type="date"
              name="yearOfPassing"
              id={`yearOfPassing-${index}`}
              value={edu.yearOfPassing}
              onChange={(e) => handleEducationChange(e, index)}
            />
            {errors.education[index].yearOfPassing && (
              <span className="error-message">
                {errors.education[index].yearOfPassing}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeEducation(index)}
            className="remove-btn"
          >
            Remove Education
          </button>
        </div>
      ))}
      <button type="button" onClick={addEducation} className="add-btn">
        Add Education
      </button>
      <h3>Professional History</h3>
      {formData.professionalHistory.map((history, index) => (
        <div key={index} className="history-group">
          <div className="form-group">
            <label htmlFor={`companyName-${index}`}>Company Name</label>
            <input
              type="text"
              name="companyName"
              id={`companyName-${index}`}
              value={history.companyName}
              onChange={(e) => handleProfessionalHistoryChange(e, index)}
            />
            {errors.professionalHistory[index] &&
              errors.professionalHistory[index].companyName && (
                <span className="error-message">
                  {errors.professionalHistory[index].companyName}
                </span>
              )}
          </div>
          <div className="form-group">
            <label htmlFor={`position-${index}`}>Position</label>
            <input
              type="text"
              name="position"
              id={`position-${index}`}
              value={history.position}
              onChange={(e) => handleProfessionalHistoryChange(e, index)}
            />
            {errors.professionalHistory[index] &&
              errors.professionalHistory[index].position && (
                <span className="error-message">
                  {errors.professionalHistory[index].position}
                </span>
              )}
          </div>
          <div className="form-group">
            <label htmlFor={`responsibility-${index}`}>Responsibility</label>
            <textarea
              name="responsibility"
              id={`responsibility-${index}`}
              value={history.responsibility}
              onChange={(e) => handleProfessionalHistoryChange(e, index)}
            ></textarea>
            {errors.professionalHistory[index] &&
              errors.professionalHistory[index].responsibility && (
                <span className="error-message">
                  {errors.professionalHistory[index].responsibility}
                </span>
              )}
          </div>
          <div className="form-group">
            <label htmlFor={`yearOfJoining-${index}`}>Year of Joining</label>
            <input
              type="date"
              name="yearOfJoining"
              id={`yearOfJoining-${index}`}
              value={history.yearOfJoining}
              onChange={(e) => handleProfessionalHistoryChange(e, index)}
            />
            {errors.professionalHistory[index] &&
              errors.professionalHistory[index].yearOfJoining && (
                <span className="error-message">
                  {errors.professionalHistory[index].yearOfJoining}
                </span>
              )}
          </div>
          <div className="form-group">
            <label htmlFor={`yearOfLeaving-${index}`}>Year of Leaving</label>
            <input
              type="date"
              name="yearOfLeaving"
              id={`yearOfLeaving-${index}`}
              value={history.isCurrentEmployee ? "" : history.yearOfLeaving}
              onChange={(e) => handleProfessionalHistoryChange(e, index)}
              disabled={history.isCurrentEmployee}
            />
            {errors.professionalHistory[index] &&
              errors.professionalHistory[index].yearOfLeaving && (
                <span className="error-message">
                  {errors.professionalHistory[index].yearOfLeaving}
                </span>
              )}
          </div>
          <div className="form-group">
            <label htmlFor={`isCurrentEmployee-${index}`}>
              Presently working here?
            </label>
            <input
              type="checkbox"
              name="isCurrentEmployee"
              id={`isCurrentEmployee-${index}`}
              checked={history.isCurrentEmployee}
              onChange={(e) => handleProfessionalHistoryChange(e, index)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeProfessionalHistory(index)}
            className="remove-btn"
          >
            Remove Professional History
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addProfessionalHistory}
        className="add-btn"
      >
        Add Professional History
      </button>
      <h3>Portfolio Links</h3>
      <div className="form-group">
        <label htmlFor="github">GitHub</label>
        <input
          type="text"
          name="github"
          value={formData.portfolioLinks.github}
          onChange={handlePortfolioLinksChange}
        />
        {errors.portfolioLinks.github && (
          <span className="error-message">{errors.portfolioLinks.github}</span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="leetcode">LeetCode</label>
        <input
          type="text"
          name="leetcode"
          value={formData.portfolioLinks.leetcode}
          onChange={handlePortfolioLinksChange}
        />
        {errors.portfolioLinks.leetcode && (
          <span className="error-message">
            {errors.portfolioLinks.leetcode}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="gfg">GeeksforGeeks</label>
        <input
          type="text"
          name="gfg"
          value={formData.portfolioLinks.gfg}
          onChange={handlePortfolioLinksChange}
        />
        {errors.portfolioLinks.gfg && (
          <span className="error-message">{errors.portfolioLinks.gfg}</span>
        )}
      </div>
      <div className="form-group">
        <input
          type="file"
          name="pdf"
          onChange={handleFileChange}
          accept="application/pdf"
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? <span className="loading-spinner"></span> : 'Create'}
      </button>
    </form>
  );
};

export default CreatePortfolio;
