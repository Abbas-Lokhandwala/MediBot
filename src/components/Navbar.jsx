import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../img/logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    navigate("/");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        {/* LEFT: Logo + title */}
        <div className="nav-left" onClick={scrollToTop} role="button" tabIndex={0}>
          <img src={logo} alt="MEDIBOT" className="nav-logo" />
          <span className="nav-title">MEDIBOT</span>
        </div>

        {/* RIGHT: Links */}
        <nav className="nav-links">
          <button type="button" className="nav-link" onClick={() => scrollTo("symptoms")}>
            Symptoms
          </button>
          <button type="button" className="nav-link" onClick={() => scrollTo("analysis")}>
            Analytics
          </button>
        </nav>
      </div>
    </header>
  );
}
