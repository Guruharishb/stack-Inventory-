import { useState, useEffect } from "react";
import api from "../utils/api";
import AppLayout from "../layouts/AppLayout";

export default function AddEmployee() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    phone: "",
    address: "",
  });

  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ---------------- FETCH EMPLOYEES ----------------
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/auth/employees");
      setEmployees(res.data);
    } catch {
      console.error("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ---------------- FORM HANDLERS ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", form);
      setSuccess("Employee added successfully ✅");
      setForm({
        name: "",
        email: "",
        password: "",
        salary: "",
        phone: "",
        address: "",
      });
      fetchEmployees();
      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE ----------------
  const deleteEmployee = async (id) => {
    if (!window.confirm("Are you going to delete?")) return;
    await api.delete(`/api/auth/employees/${id}`);
    fetchEmployees();
  };

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>

      {/* -------- MODAL -------- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Employee</h2>

            <form className="employee-form" onSubmit={handleSubmit}>
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <input name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
              <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
            </form>
          </div>
        </div>
      )}

      {/* -------- EMPLOYEE LIST -------- */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Salary</th>
              <th>Last Login</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.salary || "-"}</td>
                <td>{emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : "Never"}</td>
                <td>
                  <button className="danger" onClick={() => deleteEmployee(emp._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
