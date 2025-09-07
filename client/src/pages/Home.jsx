import backgroundImage from '../assets/background.png'; 
export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center text-white flex justify-center items-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}

    >
      {/* Optional: Add a dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Welcome to the Creator Platform
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
          Showcase your creativity, connect with other artists, and build your professional portfolio.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20 text-center"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-gray-500/20 text-center"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
