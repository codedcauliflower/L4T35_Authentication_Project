import React from 'react';

const CredentialTable = ({ credentials, handleEditCredential }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Username</th>
          <th>Password</th>
          <th>Division</th>
          <th>Organizational Unit</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(credentials) && credentials.length > 0 ? (
          credentials.map((credential) => (
            <tr key={credential._id}>
              <td>{credential.title}</td>
              <td>{credential.username}</td>
              <td>{credential.password}</td>
              <td>{credential.division}</td>
              <td>{credential.ou}</td>
              <td>
                <button onClick={() => handleEditCredential(credential)}>Edit</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No credentials available</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default CredentialTable;
