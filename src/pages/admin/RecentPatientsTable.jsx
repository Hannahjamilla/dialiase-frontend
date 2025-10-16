import React from 'react';
import { FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RecentPatientsTable = ({ patients }) => {
  const navigate = useNavigate();

  if (!patients || patients.length === 0) {
    return <div className="no-data-message">No recent patients found</div>;
  }

  return (
    <div className="recent-table-container">
      <table className="recent-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>
                <span className={`patient-type ${patient.type.toLowerCase()}`}>
                  {patient.type}
                </span>
              </td>
              <td>
                <span className={`patient-status ${patient.status.toLowerCase()}`}>
                  {patient.status}
                </span>
              </td>
              <td>{patient.created_at}</td>
              <td>
                <button 
                  className="view-btn"
                  onClick={() => navigate(`/admin/patient/${patient.id}`)}
                >
                  <FaEye />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentPatientsTable;