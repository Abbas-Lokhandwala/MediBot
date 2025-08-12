import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../img/logo.png";

export default function Navbar() {
  const { pathname } = useLocation();
  const isSpecial =
    pathname === "/results" ||
    pathname.startsWith("/results/") ||
    pathname === "/metrics" ||
    pathname.startsWith("/metrics/");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="MediBot Logo" className="navbar-logo" />
        <span className="navbar-title">MEDIBOT</span>
      </div>

      <div className="navbar-right">
        {isSpecial ? (
          <Link to="/" className="nav-link btn-like">← Back to Home</Link>
        ) : (
          <>
            <a href="#symptoms" className="nav-link">Symptoms</a>
            <a href="#analysis" className="nav-link">Analytics</a>
          </>
        )}
      </div>
    </nav>
  );
}
