import React, { useState } from "react";

const MessageInput = ({ onSendMessage, selectedUser }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      onSendMessage(selectedUser, message);
      setMessage(""); // Clear the input after sending
    }
  };

  return (
    <div className="message-input">
      {selectedUser ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${selectedUser}`}
          />
          <button type="submit" disabled={!selectedUser || !message.trim()}>
            Send
          </button>
        </form>
      ) : (
        <div className="no-user-selected">
          Select a user from the list to start messaging
        </div>
      )}
    </div>
  );
};

export default MessageInput;
