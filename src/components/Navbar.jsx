// components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`; // /public/logo.png

  const smoothScroll = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }
    return false;
  }, []);

  // If we're on Home, just scroll. If not, go Home then scroll when the section exists.
  const goToSection = useCallback(
    (id) => {
      const onHome =
        location.pathname === "/" || location.pathname === "/MediBot/";
      if (onHome) {
        smoothScroll(id);
      } else {
        navigate("/");
        let tries = 0;
        const timer = setInterval(() => {
          tries++;
          if (smoothScroll(id) || tries > 40) clearInterval(timer);
        }, 50); // poll until Home renders, then scroll
      }
    },
    [location.pathname, navigate, smoothScroll]
  );

  const showBack =
    location.pathname !== "/" && location.pathname !== "/MediBot/";

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
            <button type="button" className="nav-link" onClick={() => goToSection("symptoms")}>
              Symptoms
            </button>
            <button type="button" className="nav-link" onClick={() => goToSection("analysis")}>
              Analytics
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
