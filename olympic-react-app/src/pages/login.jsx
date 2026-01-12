import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { setSession } from "../utils/auth";
import "./Login.css"; // your slider CSS

export default function AuthSlider() {
  const navigate = useNavigate();

  // LOGIN STATE
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });



  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // ---------------- HANDLE INPUTS ----------------
  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

 

  // ---------------- LOGIN SUBMIT ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginData.email || !loginData.password) {
      setError("Please enter email and password");
      return;
    }

    setBusy(true);
    try {
      const response = await api.post("/api/auth/login", loginData);
      console.log("Login response:", response.data);

      const { token, user } = response.data;
      setSession(token, user);

      if (user.role === "owner") navigate("/owner");
      else navigate("/billing");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };


  return (
   <div className="login-page">
  <div className="login-main">

    {/* SLIDER TOGGLE */}
    <input type="checkbox" id="chk" aria-hidden="true" />

    {/* ---------------- LOGIN FORM ---------------- */}
    <div className="signup">
      <form onSubmit={handleLoginSubmit} noValidate>

        <label htmlFor="chk" aria-hidden="true" className="head">
          OLYMPIC PRINTERS
        </label>

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={loginData.email}
          onChange={handleLoginChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={loginData.password}
          onChange={handleLoginChange}
        />

        <button type="submit" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

      </form>
    </div>

    {/* ---------------- ABOUT / INFO PANEL ---------------- */}
    <div className="login">
      <label htmlFor="chk" aria-hidden="true">
        About Us
      </label>

      <div className="about-content">
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <center>
          <p>
          Olympic Printers is a professional printing & billing solution
          designed for efficient sales, inventory, and employee management.
        </p>
        </center>
        
      </div>
    </div>

  </div>
</div>

  );
}
