export default function PublicProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
      <div className="text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Public Creator Profile
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
          Discover and connect with talented creators in our community.
        </p>
        <div className="flex justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20">
            Explore Creators
          </button>
        </div>
      </div>
    </div>
  );
}
