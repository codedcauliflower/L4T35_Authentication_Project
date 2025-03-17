import React from 'react';
import '../CredentialTable.css'; // Make sure to add this CSS file

const CredentialTable = ({ credentials, user, handleEditCredential }) => {
  // Get user OUs and Divisions from user object (stored in localStorage or passed as prop)
  const userDivisionsAndOUs = user?.divisionsAndOUs || [];

  // Extract unique OUs and Divisions from userDivisionsAndOUs
  const userOUs = new Set(userDivisionsAndOUs.map((entry) => entry.ou));
  const userDivisions = new Set(userDivisionsAndOUs.map((entry) => entry.division));

  // Filter credentials based on user OUs and Divisions
  const filteredCredentials = credentials.filter(
    (credential) => userDivisions.has(credential.division)
  );

  return (
    <div className="table-container">
      <table className="credential-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Username</th>
            <th>Division</th>
            <th>Organizational Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCredentials.length > 0 ? (
            filteredCredentials.map((credential) => (
              <tr key={credential._id}>
                <td>{credential.title}</td>
                <td>{credential.username}</td>
                <td>{credential.divisionName || 'Unknown Division'}</td>
                <td>{credential.ouName || 'Unknown OU'}</td>
                <td>
                  <button onClick={() => handleEditCredential(credential)} className="edit-btn">
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-credentials">
                No credentials available for your organization.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CredentialTable;
