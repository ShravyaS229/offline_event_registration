import React, { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";

function Admin() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [password, setPassword] = useState("");

  const fetchData = useCallback(async (pass) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/admin-data`, {
        headers: { "x-admin-secret": pass }
      });

      const contentType = res.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        console.error("Expected JSON but received:", contentType);
        throw new Error("Server returned HTML instead of JSON. Is the API URL correct?");
      }
      if (res.status === 401) {
        alert("Incorrect Password");
        setPassword("");
        return;
      }

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching admin data", err);
      // Error handled via console
    } finally {
      // Data fetching complete
    }
  }, []);

  useEffect(() => {
    const promptForPassword = () => {
      const adminPass = window.prompt("Enter Admin Password:");
      if (adminPass) {
        setPassword(adminPass);
        fetchData(adminPass);
      } else {
        // No action needed if password not entered, as data will remain null
      }
    };

    promptForPassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const deleteRegistration = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    await fetch(`${process.env.REACT_APP_API_URL || ""}/api/delete/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": password }
    });

    fetchData();
  };

  const exportToExcel = () => {
    if (!data || data.registrations.length === 0) {
      alert("No data to export");
      return;
    }

    const formattedData = data.registrations.map((r) => ({
      Name: r.name,
      Email: r.email,
      USN: r.usn,
      Branch: r.branch,
      Semester: r.semester,
      Section: r.section,
      Category: r.eventCategory,
      Event: r.eventTitle
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    XLSX.writeFile(workbook, "Event_Registrations.xlsx");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2 style={{ color: 'var(--text-muted)' }}>Loading Dashboard...</h2>
    </div>
  );

  const filtered = data.registrations.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.usn?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", background: "linear-gradient(to right, #818cf8, #c084fc)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Event registration management and analytics</p>
        </div>
        <button
          onClick={exportToExcel}
          className="btn-primary"
        >
          Export to Excel
        </button>
      </header>

      {/* Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--primary)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Slots</p>
          <h2 style={{ fontSize: "2rem", marginTop: "8px" }}>{data.totalSlots}</h2>
        </div>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--success)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Used Slots</p>
          <h2 style={{ fontSize: "2rem", marginTop: "8px" }}>{data.usedSlots}</h2>
        </div>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--warning)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining</p>
          <h2 style={{ fontSize: "2rem", marginTop: "8px" }}>{data.remainingSlots}</h2>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "32px" }}>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Registrations List</h3>
          <input
            type="text"
            placeholder="Search Name / Email / USN"
            value={search}
            className="input-field"
            style={{ width: "300px" }}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "500", fontSize: "0.85rem", textTransform: "uppercase" }}>Participant</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "500", fontSize: "0.85rem", textTransform: "uppercase" }}>USN & Branch</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "500", fontSize: "0.85rem", textTransform: "uppercase" }}>Details</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "500", fontSize: "0.85rem", textTransform: "uppercase" }}>Event</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "500", fontSize: "0.85rem", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((r) => (
                <tr key={r._id} style={{ background: "rgba(255, 255, 255, 0.02)", transition: "background 0.2s" }}>
                  <td style={{ padding: "16px", borderRadius: "12px 0 0 12px" }}>
                    <div style={{ fontWeight: "600" }}>{r.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.email}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "500" }}>{r.usn}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.branch} - Sem {r.semester}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.9rem" }}>Sec {r.section}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.phone}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "500" }}>{r.eventTitle}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.eventCategory}</div>
                  </td>
                  <td style={{ padding: "16px", borderRadius: "0 12px 12px 0", textAlign: "right" }}>
                    <button
                      onClick={() => deleteRegistration(r._id)}
                      style={{
                        color: "var(--error)",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.background = "rgba(239, 68, 68, 0.2)"}
                      onMouseOut={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No registrations found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} entries
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="btn-primary"
              style={{ padding: "8px 16px", opacity: currentPage === 1 ? 0.5 : 1, pointerEvents: currentPage === 1 ? 'none' : 'auto' }}
            >
              Previous
            </button>
            <div style={{ display: "flex", alignItems: "center", padding: "0 16px", fontWeight: "600" }}>
              {currentPage} / {totalPages || 1}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="btn-primary"
              style={{ padding: "8px 16px", opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, pointerEvents: (currentPage === totalPages || totalPages === 0) ? 'none' : 'auto' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;