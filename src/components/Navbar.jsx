// components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`; // put logo.png in /public

  const showBack = pathname !== "/"; // HashRouter will still set "/" on home

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">
          <img src={logoUrl} alt="MediBot" className="navbar-logo" />
          <span className="navbar-title">MEDIBOT</span>
        </Link>
      </div>

      <nav className="navbar-right">
        {showBack ? (
          <Link to="/" className="nav-link btn-like">⬅ Back to Home</Link>
        ) : (
          <>
            <Link to="/symptoms" className="nav-link">Symptoms</Link>
            <Link to="/metrics" className="nav-link">Analytics</Link>
          </>
        )}
      </nav>
    </header>
  );
}
