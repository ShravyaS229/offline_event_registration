import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./Admin";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    usn: "",
    branch: "",
    semester: "",
    section: "",
    email: "",
    phone: "",
    eventCategory: "",
    eventTitle: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Save locally if offline
  const saveLocally = (data) => {
    let offlineData =
      JSON.parse(localStorage.getItem("offlineRegistrations")) || [];

    offlineData.push(data);

    localStorage.setItem(
      "offlineRegistrations",
      JSON.stringify(offlineData)
    );

    alert("Saved offline. Will sync automatically when internet is back.");
  };

  const removeFromLocal = (timestamp) => {
    let offlineData =
      JSON.parse(localStorage.getItem("offlineRegistrations")) || [];

    offlineData = offlineData.filter(
      (item) => item.timestamp !== timestamp
    );

    localStorage.setItem(
      "offlineRegistrations",
      JSON.stringify(offlineData)
    );
  };

  // Send to backend
  const sendToServer = async (data) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (response.ok) {
        removeFromLocal(data.timestamp);
        alert("Registration Successful");
      } else {
        removeFromLocal(data.timestamp);
        alert(result.message);
      }

    } catch (error) {
      console.log("Still offline...");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      timestamp: Date.now()
    };

    if (!navigator.onLine) {
      saveLocally(submissionData);
    } else {
      sendToServer(submissionData);
    }

    setFormData({
      name: "",
      usn: "",
      branch: "",
      semester: "",
      section: "",
      email: "",
      phone: "",
      eventCategory: "",
      eventTitle: ""
    });
  };

  // Auto Sync when internet comes back
  useEffect(() => {
    const syncOfflineData = async () => {
      let offlineData =
        JSON.parse(localStorage.getItem("offlineRegistrations")) || [];

      if (offlineData.length === 0) return;

      offlineData.sort((a, b) => a.timestamp - b.timestamp);

      for (let data of offlineData) {
        await sendToServer(data);
      }
    };

    window.addEventListener("online", syncOfflineData);

    return () => {
      window.removeEventListener("online", syncOfflineData);
    };
  }, []);

  return (
    <Router>
      <Routes>

        {/* Registration Page */}
        <Route
          path="/"
          element={
            <div className="container">
              <h2>Event Registration</h2>

              <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name *" required value={formData.name} onChange={handleChange} />
                <input name="usn" placeholder="USN *" required value={formData.usn} onChange={handleChange} />
                <input name="branch" placeholder="Branch *" required value={formData.branch} onChange={handleChange} />
                <input name="semester" placeholder="Semester *" required value={formData.semester} onChange={handleChange} />
                <input name="section" placeholder="Section *" required value={formData.section} onChange={handleChange} />
                <input name="email" type="email" placeholder="Email *" required value={formData.email} onChange={handleChange} />
                <input name="phone" placeholder="Phone *" required value={formData.phone} onChange={handleChange} />
                <input name="eventCategory" placeholder="Event Category *" required value={formData.eventCategory} onChange={handleChange} />
                <input name="eventTitle" placeholder="Event Title *" required value={formData.eventTitle} onChange={handleChange} />
                <button type="submit">Register</button>
              </form>
            </div>
          }
        />

        {/* Admin Page */}
        <Route path="/admin" element={<Admin />} />

      </Routes>
    </Router>
  );
}

export default App;