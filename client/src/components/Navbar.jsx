// src/components/Navbar.jsx
export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white border-b border-gray-800 shadow-lg">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        whiz
      </h1>
      <button
        onClick={() => {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }}
        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-red-500/20"
      >
        Logout
      </button>
    </nav>
  );
}
