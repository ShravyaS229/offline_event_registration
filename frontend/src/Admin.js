import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

function Admin() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin-data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteRegistration = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    await fetch(`http://localhost:5000/api/delete/${id}`, {
      method: "DELETE"
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

  if (!data) return <h2>Loading...</h2>;

  const filtered = data.registrations.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.usn?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <h3>Total Slots: {data.totalSlots}</h3>
      <h3>Used Slots: {data.usedSlots}</h3>
      <h3>Remaining Slots: {data.remainingSlots}</h3>

      <br />

      <button
        onClick={exportToExcel}
        style={{
          padding: "8px 15px",
          backgroundColor: "green",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        Export to Excel
      </button>

      <br /><br />

      <input
        type="text"
        placeholder="Search Name / Email / USN"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "6px", width: "250px" }}
      />

      <br /><br />

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>USN</th>
            <th>Branch</th>
            <th>Semester</th>
            <th>Section</th>
            <th>Category</th>
            <th>Event</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.usn}</td>
              <td>{r.branch}</td>
              <td>{r.semester}</td>
              <td>{r.section}</td>
              <td>{r.eventCategory}</td>
              <td>{r.eventTitle}</td>
              <td>
                <button
                  onClick={() => deleteRegistration(r._id)}
                  style={{ color: "red" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;