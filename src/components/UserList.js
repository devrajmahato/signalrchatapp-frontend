import React from 'react';

const UserList = ({ users, currentUser, onSelectUser, selectedUser }) => {
  // Filter out the current user from the list
  const otherUsers = users.filter(user => user !== currentUser);

  return (
    <div className="user-list">
      <h3>Online Users</h3>
      <ul>
        {otherUsers.map((user, index) => (
          <li 
            key={index} 
            className={selectedUser === user ? 'selected' : ''}
            onClick={() => onSelectUser(user)}
          >
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;