import { showSuccess, showError } from "../utils/toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  async function loginDirectly() {
    try {
      setLoading(true);

      const res = await API.post(
        "/auth/firebase-login",
        {
          phone: "+919999999999"
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "role",
        res.data.user.role
      );

      showSuccess(
        "Login successful"
      );

      navigate("/workspace");

    } catch (err) {

      console.log(err);

      showError(
        err.response?.data?.error ||
        err.message
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171717]">
      <button
        onClick={loginDirectly}
        disabled={loading}
        className="
          bg-gradient-to-r
          from-purple-600
          to-cyan-500
          px-8
          py-4
          rounded-xl
          text-white
          font-bold
        "
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}