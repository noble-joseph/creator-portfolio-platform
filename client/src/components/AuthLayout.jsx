// src/components/AuthLayout.jsx
import musicianImg from "../assets/musician.jpg";
import photographerImg from "../assets/photographer.jpg";

export default function AuthLayout({ children, role, setRole, showRoleSelector = true }) {
  const getImage = () => (role === "musician" ? musicianImg : photographerImg);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
        <h1 className="text-4xl font-serif tracking-wide">whiz</h1>
        {showRoleSelector && (
          <div className="flex gap-4">
            {["photographer", "musician"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300
                  ${role === r
                    ? "bg-white text-black shadow-lg"
                    : "bg-gray-800 hover:bg-gray-700"}`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-6xl">
          {/* Left: Image */}
          <div className="flex justify-center">
            <img
              src={getImage()}
              alt={role}
              className="w-60 h-60 md:w-72 md:h-72 object-cover rounded-xl shadow-xl border border-gray-700"
            />
          </div>

          {/* Right: Form Area */}
          <div className="flex flex-col gap-6 w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
