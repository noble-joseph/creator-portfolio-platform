import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      login(accessToken, refreshToken);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [location, login, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Signing you in...</p>
    </div>
  );
}
