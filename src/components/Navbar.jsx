// components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

  const showBackButton =
    location.pathname !== "/" && location.pathname !== "/MediBot/"; // for GH Pages

  return (
    <header className="nav flex items-center gap-4">
      <Link to="/" className="flex items-center gap-2">
        <img src={logoUrl} alt="MediBot" width={32} height={32} />
        <span className="font-bold">MEDIBOT</span>
      </Link>

      <nav className="ml-auto flex gap-6">
        {showBackButton ? (
          <Link to="/" className="btn">
            ⬅ Back to Home
          </Link>
        ) : (
          <>
            <Link to="/symptoms" className="btn">Symptoms</Link>
            <Link to="/analytics" className="btn">Analytics</Link>
          </>
        )}
      </nav>
    </header>
  );
}
