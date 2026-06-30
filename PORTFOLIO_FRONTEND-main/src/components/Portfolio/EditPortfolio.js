import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../Portfolio/PortfolioForm.css";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import debounce from "lodash.debounce";
import {baseUrl} from '../url'

// Component for handling individual project input
const ProjectInput = ({ project, index, onChange, onRemove, errors }) => (
  <div key={index} className="project-group">
    <div className="form-group">
      <label htmlFor={`project-title-${index}`}>Project Title</label>
      <input
        type="text"
        name="title"
        id={`project-title-${index}`}
        value={project.title}
        onChange={(e) => onChange(e, index)}
        required
      />
      {errors && errors.title && (
        <span className="error-message">{errors.title}</span>
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
        onChange={(e) => onChange(e, index)}
      ></textarea>
      {errors && errors.description && (
        <span className="error-message">{errors.description}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`project-link-${index}`}>Project Link</label>
      <input
        type="text"
        name="link"
        id={`project-link-${index}`}
        value={project.link}
        onChange={(e) => onChange(e, index)}
      />
      {errors && errors.link && (
        <span className="error-message">{errors.link}</span>
      )}
    </div>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="remove-btn"
    >
      Remove Project
    </button>
  </div>
);

// Component for handling individual education input
const EducationInput = ({ edu, index, onChange, onBlur, onRemove, errors }) => (
  <div key={index} className="education-group">
    <div className="form-group">
      <label htmlFor={`collegeName-${index}`}>College Name</label>
      <input
        type="text"
        name="collegeName"
        id={`collegeName-${index}`}
        value={edu.collegeName}
        onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)}
        required
      />
      {errors && errors.collegeName && (
        <span className="error-message">{errors.collegeName}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`degree-${index}`}>Degree</label>
      <select
        name="degree"
        id={`degree-${index}`}
        value={edu.degree}
        onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)}
      >
        <option value="">Select Degree</option>
        <option value="Btech">Btech</option>
        <option value="Mtech">Mtech</option>
        <option value="Diploma">Diploma</option>
      </select>
      {errors && errors.degree && (
        <span className="error-message">{errors.degree}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`branch-${index}`}>Branch</label>
      <select
        name="branch"
        id={`branch-${index}`}
        value={edu.branch}
        onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)}
      >
        <option value="">Select Branch</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Information Technology">Information Technology</option>
        <option value="Mechanical Engineering">Mechanical Engineering</option>
        <option value="Electronics Engineering">Electronics Engineering</option>
        <option value="Electrical Engineering">Electrical Engineering</option>
      </select>
      {errors && errors.branch && (
        <span className="error-message">{errors.branch}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`cgpaOrPercentage-${index}`}>CGPA/Percentage</label>
      <input
        type="text"
        name="cgpaOrPercentage"
        id={`cgpaOrPercentage-${index}`}
        value={edu.cgpaOrPercentage}
        onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)}
      />
      {errors && errors.cgpaOrPercentage && (
        <span className="error-message">{errors.cgpaOrPercentage}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`yearOfJoining-${index}`}>Year of Joining</label>
      <input
        type="date"
        name="yearOfJoining"
        id={`yearOfJoining-${index}`}
        value={edu.yearOfJoining}
        onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)}
        required
      />
      {errors && errors.yearOfJoining && (
        <span className="error-message">{errors.yearOfJoining}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`yearOfPassing-${index}`}>Year of Passing</label>
      <input
        type="date"
        name="yearOfPassing"
        id={`yearOfPassing-${index}`}
        value={edu.yearOfPassing}
        onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)}
        required
      />
      {errors && errors.yearOfPassing && (
        <span className="error-message">{errors.yearOfPassing}</span>
      )}
    </div>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="remove-btn"
    >
      Remove Education
    </button>
  </div>
);


// Component for handling individual professional history input
const ProfessionalHistoryInput = ({
  hist,
  index,
  onChange,
  onRemove,
  errors,
}) => (
  <div key={index} className="professional-history-group">
    <div className="form-group">
      <label htmlFor={`companyName-${index}`}>Company Name</label>
      <input
        type="text"
        name="companyName"
        id={`companyName-${index}`}
        value={hist.companyName}
        onChange={(e) => onChange(e, index)}
        required
      />
      {errors && errors.companyName && (
        <span className="error-message">{errors.companyName}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`position-${index}`}>Position</label>
      <input
        type="text"
        name="position"
        id={`position-${index}`}
        value={hist.position}
        onChange={(e) => onChange(e, index)}
      />
      {errors && errors.position && (
        <span className="error-message">{errors.position}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`responsibility-${index}`}>Responsibility</label>
      <textarea
        name="responsibility"
        id={`responsibility-${index}`}
        value={hist.responsibility}
        onChange={(e) => onChange(e, index)}
      ></textarea>
      {errors && errors.responsibility && (
        <span className="error-message">{errors.responsibility}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`yearOfJoining-${index}`}>Year of Joining</label>
      <input
        type="date"
        name="yearOfJoining"
        id={`yearOfJoining-${index}`}
        value={hist.yearOfJoining}
        onChange={(e) => onChange(e, index)}
      />
      {errors && errors.yearOfJoining && (
        <span className="error-message">{errors.yearOfJoining}</span>
      )}
    </div>
    <div className="form-group">
      <label htmlFor={`yearOfLeaving-${index}`}>Year of Leaving</label>
      <input
        type="date"
        name="yearOfLeaving"
        id={`yearOfLeaving-${index}`}
        value={hist.isCurrentEmployee ? "" : hist.yearOfLeaving}
        onChange={(e) => onChange(e, index)}
        disabled={hist.isCurrentEmployee}
      />
      {errors && errors.yearOfLeaving && (
        <span className="error-message">{errors.yearOfLeaving}</span>
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
        checked={hist.isCurrentEmployee}
        onChange={(e) => onChange(e, index)}
      />
    </div>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="remove-btn"
    >
      Remove Professional History
    </button>
  </div>
);

const EditPortfolio = () => {
  const { user } = useContext(AuthContext);
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
    pdf: null, // Include PDF field
  });

  useEffect(() => {
    const fetchPortfolio = debounce(async () => {
      try {
        const { data } = await axios.get(
          `${baseUrl}/api/portfolio`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );

        // Transform date strings if necessary
        const transformData = (portfolio) => {
          // Ensure all date fields are properly formatted
          return {
            ...portfolio,
            education: portfolio.education.map((edu) => ({
              ...edu,
              yearOfJoining: edu.yearOfJoining
                ? new Date(edu.yearOfJoining).toISOString().substring(0, 10)
                : "",
              yearOfPassing: edu.yearOfPassing
                ? new Date(edu.yearOfPassing).toISOString().substring(0, 10)
                : "",
            })),
            professionalHistory: portfolio.professionalHistory.map((hist) => ({
              ...hist,
              yearOfJoining: hist.yearOfJoining
                ? new Date(hist.yearOfJoining).toISOString().substring(0, 10)
                : "",
              yearOfLeaving: hist.yearOfLeaving
                ? new Date(hist.yearOfLeaving).toISOString().substring(0, 10)
                : "",
            })),
          };
        };

        setFormData(transformData(data));
        setCurrentPdfUrl(`${baseUrl}/api/portfolio/download/${data._id}`); // Set the current PDF URL
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    }, 300);

    fetchPortfolio();
    return () => fetchPortfolio.cancel();
  }, []);
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
  const [loading, setLoading] = useState(false); // Add loading state

  const nameValidator = /^[a-zA-Z\s]*$/;

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
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null); // State for current PDF URL

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

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        { title: "", description: "", link: "" },
      ],
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      projects: [
        ...prevErrors.projects,
        { title: "", description: "", link: "" },
      ],
    }));
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });

    setErrors({
      ...errors,
      projects: errors.projects.filter((_, i) => i !== index),
    });
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    const updatedEducation = formData.education.map((edu, i) =>
      i === index ? { ...edu, [name]: value } : edu
    );

    setFormData({ ...formData, education: updatedEducation });

    // Validate the updated field
    const updatedErrors = errors.education.map((eduError, i) =>
      i === index
        ? { ...eduError, [name]: validateEducationField(name, value, index) }
        : eduError
    );

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
    }

    setErrors({ ...errors, education: updatedErrors });
  };

  const handleEducationBlur = (e, index) => {
    const { name, value } = e.target;
    const updatedErrors = errors.education.map((eduError, i) =>
      i === index
        ? { ...eduError, [name]: validateEducationField(name, value, index) }
        : eduError
    );
    setErrors({ ...errors, education: updatedErrors });
  };
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

  const addEducation = () => {
    const newEducation = {
      collegeName: "",
      degree: "",
      branch: "",
      cgpaOrPercentage: "",
      yearOfJoining: "",
      yearOfPassing: "",
    };

    setFormData((prevFormData) => ({
      ...prevFormData,
      education: [...prevFormData.education, newEducation],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      education: [
        ...prevErrors.education,
        {
          collegeName: "",
          degree: "",
          branch: "",
          cgpaOrPercentage: "",
          yearOfJoining: "",
          yearOfPassing: "",
        },
      ],
    }));
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

  const handleProfessionalHistoryChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const updatedProfessionalHistory = formData.professionalHistory.map(
      (hist, i) =>
        i === index
          ? {
              ...hist,
              [name]: type === "checkbox" ? checked : value,
            }
          : hist
    );

    setFormData({
      ...formData,
      professionalHistory: updatedProfessionalHistory,
    });

    // Validate the updated field
    const error = validateProfessionalHistoryField(
      name,
      type === "checkbox" ? checked : value,
      index,
      updatedProfessionalHistory
    );

    // Update the error state
    const updatedHistoryErrors = errors.professionalHistory.map(
      (historyError, i) =>
        i === index ? { ...historyError, [name]: error } : historyError
    );
    setErrors({ ...errors, professionalHistory: updatedHistoryErrors });
  };

  const validateProfessionalHistoryField = (
    name,
    value,
    index,
    updatedHistory
  ) => {
    const professionalHistory = updatedHistory[index];
    const { yearOfJoining, yearOfLeaving, isCurrentEmployee } =
      professionalHistory;

    switch (name) {
      case "companyName":
        if (!value.trim()) return "Company name is required";
        return "";
      case "position":
        if (!value.trim()) return "Position is required";
        return "";
      case "responsibility":
        if (!value.trim()) return "Responsibility is required";
        if (!/^[A-Z][^.!?]*\.\s*(?:[A-Z][^.!?]*\.\s*)*$/.test(value)) {
          return "Responsibility must start with a capital letter and end with a period.";
        }
        return "";
      case "yearOfJoining":
        if (!value) return "Year of joining is required";
        if (yearOfLeaving && new Date(value) >= new Date(yearOfLeaving)) {
          return "Year of joining must be before Year of leaving";
        }
        return "";
      case "yearOfLeaving":
        if (!isCurrentEmployee && !value) return "Year of leaving is required";
        if (
          !isCurrentEmployee &&
          yearOfJoining &&
          new Date(value) <= new Date(yearOfJoining)
        ) {
          return "Year of leaving must be after Year of joining";
        }
        return "";
      case "isCurrentEmployee":
        if (value && professionalHistory.yearOfLeaving) {
          professionalHistory.yearOfLeaving = "";
        }
        return "";
      default:
        return "";
    }
  };

  const addProfessionalHistory = () => {
    const newHistory = {
      companyName: "",
      position: "",
      responsibility: "",
      yearOfJoining: "",
      yearOfLeaving: "",
      isCurrentEmployee: false,
    };

    setFormData((prevFormData) => ({
      ...prevFormData,
      professionalHistory: [...prevFormData.professionalHistory, newHistory],
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
          isCurrentEmployee: "",
        },
      ],
    }));
  };

  const removeProfessionalHistory = (index) => {
    setFormData({
      ...formData,
      professionalHistory: formData.professionalHistory.filter(
        (_, i) => i !== index
      ),
    });

    setErrors({
      ...errors,
      professionalHistory: errors.professionalHistory.filter(
        (_, i) => i !== index
      ),
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Validation check
    const isFormValid =
      !errors.title &&
      !errors.description &&
      formData.projects.every(
        (project, index) =>
          !errors.projects?.[index]?.title &&
          !errors.projects?.[index]?.description &&
          !errors.projects?.[index]?.link
      ) &&
      formData.education.every(
        (edu, index) =>
          !Object.values(errors.education?.[index] || {}).some((error) => error)
      ) &&
      formData.professionalHistory.every(
        (history, index) =>
          !Object.values(errors.professionalHistory?.[index] || {}).some(
            (error) => error
          )
      ) &&
      !Object.values(errors.portfolioLinks || {}).some((error) => error);
  
    if (!isFormValid) {
      // Show a message or highlight errors
      toast.error("Please fix the errors in the form before submitting.");
      setLoading(false);
      return;
    }
  
    try {
      // Format the data
      const formattedData = new FormData();
  
      // General fields
      formattedData.append("title", formData.title);
      formattedData.append("description", formData.description);
  
      // Handle file upload if a file is selected
      if (formData.pdf) {
        formattedData.append("pdf", formData.pdf);
      }
  
      // Projects
      formData.projects.forEach((project, index) => {
        formattedData.append(`projects[${index}][title]`, project.title);
        formattedData.append(`projects[${index}][description]`, project.description);
        formattedData.append(`projects[${index}][link]`, project.link);
      });
  
      // Education
      formData.education.forEach((edu, index) => {
        formattedData.append(`education[${index}][collegeName]`, edu.collegeName);
        formattedData.append(`education[${index}][degree]`, edu.degree);
        formattedData.append(`education[${index}][branch]`, edu.branch);
        formattedData.append(`education[${index}][cgpaOrPercentage]`, edu.cgpaOrPercentage);
  
        // Format dates
        formattedData.append(
          `education[${index}][yearOfJoining]`,
          edu.yearOfJoining ? new Date(edu.yearOfJoining).toISOString() : ""
        );
        formattedData.append(
          `education[${index}][yearOfPassing]`,
          edu.yearOfPassing ? new Date(edu.yearOfPassing).toISOString() : ""
        );
      });
  
      // Professional history
      formData.professionalHistory.forEach((history, index) => {
        formattedData.append(`professionalHistory[${index}][companyName]`, history.companyName);
        formattedData.append(`professionalHistory[${index}][position]`, history.position);
        formattedData.append(`professionalHistory[${index}][responsibility]`, history.responsibility);
  
        // Format dates
        formattedData.append(
          `professionalHistory[${index}][yearOfJoining]`,
          history.yearOfJoining ? new Date(history.yearOfJoining).toISOString() : ""
        );
        formattedData.append(
          `professionalHistory[${index}][yearOfLeaving]`,
          history.isCurrentEmployee
            ? "1970-01-01T00:00:00.000Z" // Placeholder for current employee
            : history.yearOfLeaving
            ? new Date(history.yearOfLeaving).toISOString()
            : ""
        );
        formattedData.append(`professionalHistory[${index}][isCurrentEmployee]`, history.isCurrentEmployee);
      });
  
      // Portfolio links
      Object.keys(formData.portfolioLinks).forEach((key) => {
        formattedData.append(`portfolioLinks[${key}]`, formData.portfolioLinks[key]);
      });
  
      // Send the data to the API
      const response = await axios.put(`${baseUrl}/api/portfolio`, formattedData, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
          "Content-Type": "multipart/form-data", // Important for FormData submission
        },
      });
  
      // Success message
      toast.success("Portfolio updated successfully!", { containerId: 'global' });
  
      // Redirect to public portfolio
  
    } catch (err) {
      // Error handling
      toast.error("Error updating portfolio", { containerId: 'global' });
      console.error(err.response?.data || err.message);
    } finally {
      // Set loading to false when submission ends
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="portfolio-form">
      <h2>Edit Portfolio</h2>

      {/* Title and Description */}
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        {errors.title && <p className="error-message">{errors.title}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
        {errors.description && (
          <p className="error-message">{errors.description}</p>
        )}
      </div>

      {/* Projects */}
      <h3>Projects</h3>
      {formData.projects.map((project, index) => (
        <ProjectInput
          key={index}
          project={project}
          index={index}
          onChange={handleProjectChange}
          onRemove={removeProject}
          errors={errors.projects[index]}
        />
      ))}
      <button type="button" onClick={addProject} className="add-btn">
        Add Project
      </button>

      {/* Education */}
      <h3>Education</h3>
      {formData.education.map((edu, index) => (
        <EducationInput
          key={index}
          edu={edu}
          index={index}
          onChange={handleEducationChange}
          onBlur={handleEducationBlur}
          onRemove={removeEducation}
          errors={errors.education[index]}
        />
      ))}
      <button type="button" onClick={addEducation} className="add-btn">
        Add Education
      </button>

      {/* Professional History */}
      <h3>Professional History</h3>
      {formData.professionalHistory.map((hist, index) => (
        <ProfessionalHistoryInput
          hist={hist}
          index={index}
          onChange={handleProfessionalHistoryChange}
          onRemove={removeProfessionalHistory}
          errors={errors.professionalHistory[index] || {}}
        />
      ))}
      <button
        type="button"
        onClick={addProfessionalHistory}
        className="add-btn"
      >
        Add Professional History
      </button>

      {/* Portfolio Links */}
      <h3>Portfolio Links</h3>
      <div className="form-group">
        <label htmlFor="github">GitHub</label>
        <input
          type="text"
          name="github"
          id="github"
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
          id="leetcode"
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
          id="gfg"
          value={formData.portfolioLinks.gfg}
          onChange={handlePortfolioLinksChange}
        />
        {errors.portfolioLinks.gfg && (
          <span className="error-message">{errors.portfolioLinks.gfg}</span>
        )}
      </div>
      {/* PDF Upload */}
      <div className="form-group">
        <label>Upload PDF</label>
        <input type="file" name="pdf" onChange={handleFileChange} accept="application/pdf" />
        {currentPdfUrl && (
          <div>
            <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer" >
              View current PDF
            </a>
          </div>
        )}
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <span className="loading-spinner"></span> : 'Update'}
        </button>
    </form>
  );
};

export default EditPortfolio;
