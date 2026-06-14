// Add this to your Navbar.tsx (or wherever the logout button lives)

import { clearAuthSession } from "../hooks/useAuthRestore";
import { useApp } from "../context/AppContext";

// inside component:
const { setRole, setUserProfile } = useApp();

const handleLogout = () => {
  clearAuthSession();
  setUserProfile(null as any);
  setRole("guest" as any); // use whatever your default/guest role value is
};

// <button onClick={handleLogout}>Logout</button>