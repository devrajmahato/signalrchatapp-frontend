import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.onReceiveMessage = null;
    this.onUsersUpdated = null;
    this.onMessageSent = null;
  }

  // Initialize the SignalR connection
  initConnection = (userId) => {
    // Configuration object to make it easier to change the backend URL
    const config = {
      backendUrl:
        process.env.REACT_APP_BACKEND_URL || "https://localhost:7025/chathub", // Update with your backend URL
    };

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(config.backendUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    // Start the connection
    this.connection
      .start()
      .then(() => {
        console.log("SignalR Connected");
        // Register the user after connection is established
        this.connection
          .invoke("RegisterUser", userId)
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error("SignalR Connection Error: ", err));

    // Set up event listeners
    this.connection.on("ReceiveMessage", (message) => {
      if (this.onReceiveMessage) {
        this.onReceiveMessage(message);
      }
    });

    this.connection.on("UsersUpdated", (users) => {
      if (this.onUsersUpdated) {
        this.onUsersUpdated(users);
      }
    });

    this.connection.on("MessageSent", (result) => {
      if (this.onMessageSent) {
        this.onMessageSent(result);
      }
    });
  };

  // Send a message to a specific user
  sendMessageToUser = (receiverId, message) => {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      this.connection
        .invoke("SendMessageToUser", receiverId, message)
        .catch((err) => console.error(err));
    } else {
      console.error("SignalR connection is not established");
    }
  };

  // Get online users
  getOnlineUsers = () => {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      this.connection
        .invoke("GetOnlineUsers")
        .catch((err) => console.error(err));
    }
  };

  // Set callback for receiving messages
  setOnReceiveMessage = (callback) => {
    this.onReceiveMessage = callback;
  };

  // Set callback for user list updates
  setOnUsersUpdated = (callback) => {
    this.onUsersUpdated = callback;
  };

  // Set callback for message sent confirmation
  setOnMessageSent = (callback) => {
    this.onMessageSent = callback;
  };

  // Close the connection
  closeConnection = () => {
    if (this.connection) {
      this.connection.stop();
    }
  };
}

const signalRService = new SignalRService();
export default signalRService;
