import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/admin/users");
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    const fetchPortfolios = async () => {
      try {
        const { data } = await axios.get("/api/admin/portfolios");
        setPortfolios(data);
      } catch (error) {
        console.error("Error fetching portfolios", error);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get("/api/admin/analytics");
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics", error);
      }
    };

    fetchUsers();
    fetchPortfolios();
    fetchAnalytics();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Analytics</h2>
        <p>Total Users: {analytics.userCount}</p>
        <p>Total Portfolios: {analytics.portfolioCount}</p>
        <p>Approved Portfolios: {analytics.approvedPortfolios}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <ul>
          {users.map(user => (
            <li key={user._id}>
              {user.name} ({user.username}) - {user.email} - Role: {user.role}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Portfolios</h2>
        <ul>
          {portfolios.map(portfolio => (
            <li key={portfolio._id}>
              {portfolio.title} by {portfolio.creator.name} - Status: {portfolio.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
