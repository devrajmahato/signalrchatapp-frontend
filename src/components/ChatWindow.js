import React, { useState, useEffect } from "react";
import signalRService from "../services/signalRService";
import UserList from "./UserList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Initialize the component
  useEffect(() => {
    // Set up event handlers for SignalR
    signalRService.setOnReceiveMessage(handleReceiveMessage);
    signalRService.setOnUsersUpdated(handleUsersUpdated);
    signalRService.setOnMessageSent(handleMessageSent);

    // Set current user (in a real app, this would come from authentication)
    const userId = "user_" + Date.now(); // Generate a unique user ID for this session
    setCurrentUser(userId);

    // Initialize SignalR connection
    signalRService.initConnection(userId);
    setIsConnected(true);

    // Clean up on component unmount
    return () => {
      signalRService.closeConnection();
    };
  }, []);

  // Handle receiving a message
  const handleReceiveMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Handle user list updates
  const handleUsersUpdated = (users) => {
    setUsers(users);
  };

  // Handle message sent confirmation
  const handleMessageSent = (result) => {
    if (result.success) {
      console.log(`Message sent to ${result.receiver}`);
    } else {
      console.error(
        `Failed to send message to ${result.receiver}: ${result.error}`
      );
    }
  };

  // Handle sending a message
  const handleSendMessage = (receiverId, message) => {
    signalRService.sendMessageToUser(receiverId, message);

    // Add the message to our local list as well (for the sender's view)
    const newMessage = {
      sender: currentUser,
      receiver: receiverId,
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Handle selecting a user to message
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="chat-window">
      <h1>SignalR Chat App</h1>
      <p className="status">
        Status: {isConnected ? "Connected" : "Disconnected"} | User:{" "}
        {currentUser}
      </p>

      <div className="chat-container">
        <div className="sidebar">
          <UserList
            users={users}
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
          />
        </div>

        <div className="main-content">
          <MessageList messages={messages} currentUser={currentUser} />
          <MessageInput
            onSendMessage={handleSendMessage}
            selectedUser={selectedUser}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
