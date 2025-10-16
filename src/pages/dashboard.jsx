import React from 'react';

const Dashboard = ({ user }) => {
  // Add null check for user prop
  if (!user) {
    return (
      <div className="dashboard">
        <h1>Welcome!</h1>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Hi {user.name || 'User'}</h1> {/* Fallback to 'User' if name is undefined */}
      <p>Welcome to the dashboard</p>
      {/* Add other dashboard components here */}
    </div>
  );
};

export default Dashboard;