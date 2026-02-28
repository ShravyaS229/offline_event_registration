import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
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

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  // Update pending count from localStorage
  const updatePendingCount = useCallback(() => {
    const offlineData = JSON.parse(localStorage.getItem("offlineRegistrations")) || [];
    setPendingCount(offlineData.length);
  }, []);

  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

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

    updatePendingCount();
    toast.info("Saved offline. Will sync automatically when internet is back.");
  };

  const removeFromLocal = useCallback((timestamp) => {
    let offlineData =
      JSON.parse(localStorage.getItem("offlineRegistrations")) || [];

    offlineData = offlineData.filter(
      (item) => item.timestamp !== timestamp
    );

    localStorage.setItem(
      "offlineRegistrations",
      JSON.stringify(offlineData)
    );
    updatePendingCount();
  }, [updatePendingCount]);

  // Send to backend
  const sendToServer = useCallback(async (data) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ""}/api/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (response.ok) {
        removeFromLocal(data.timestamp);
        toast.success("Registration Successful");
      } else {
        removeFromLocal(data.timestamp);
        toast.error(result.message);
      }

    } catch (error) {
      console.log("Still offline...");
    }
  }, [removeFromLocal]);

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
  const syncOfflineData = useCallback(async () => {
    let offlineData =
      JSON.parse(localStorage.getItem("offlineRegistrations")) || [];

    if (offlineData.length === 0) return;

    offlineData.sort((a, b) => a.timestamp - b.timestamp);

    for (let data of offlineData) {
      await sendToServer(data);
    }
  }, [sendToServer]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>

        {/* Registration Page */}
        <Route
          path="/"
          element={
            <div className="registration-wrapper">
              <div className="registration-card glass-card">
                <div className="registration-header">
                  <h2>Event Registration</h2>
                  <p>Secure your spot in the upcoming mega event.</p>
                </div>

                {/* Status Banner */}
                <div className={`status-banner ${isOnline ? 'status-online' : 'status-offline'}`}>
                  <div className="status-indicator"></div>
                  {isOnline ? "System Online" : "System Offline - Data will sync later"}
                  {pendingCount > 0 && <span className="pending-badge">{pendingCount} Pending</span>}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="input-field" name="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                  </div>

                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label className="form-label">USN</label>
                      <input className="input-field" name="usn" placeholder="1MS21CS000" required value={formData.usn} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="form-label">Branch</label>
                      <input className="input-field" name="branch" placeholder="CSE" required value={formData.branch} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label className="form-label">Semester</label>
                      <input className="input-field" name="semester" placeholder="6" required value={formData.semester} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="form-label">Section</label>
                      <input className="input-field" name="section" placeholder="A" required value={formData.section} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="input-field" name="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="input-field" name="phone" placeholder="+91 9876543210" required value={formData.phone} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event Details</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <input className="input-field" name="eventCategory" placeholder="Technical" required value={formData.eventCategory} onChange={handleChange} />
                      <input className="input-field" name="eventTitle" placeholder="Code Rush" required value={formData.eventTitle} onChange={handleChange} />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Complete Registration
                  </button>
                </form>
              </div>
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