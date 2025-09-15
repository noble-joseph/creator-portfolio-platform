import React from "react";
import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex space-x-4">
      <Link to="/admin" className="hover:underline">
        Dashboard
      </Link>
      <Link to="/admin/users" className="hover:underline">
        Users
      </Link>
      <Link to="/admin/portfolios" className="hover:underline">
        Portfolios
      </Link>
      <Link to="/admin/analytics" className="hover:underline">
        Analytics
      </Link>
    </nav>
  );
}
