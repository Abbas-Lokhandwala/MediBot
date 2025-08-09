import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-title">
        <div className="logo" />
        <span>MEDIBOT</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/metrics">Model Metrics</NavLink>
      </div>
    </nav>
  );
}