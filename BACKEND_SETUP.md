# SignalR Chat Application Backend Setup

To run this application properly, you need both the frontend and backend servers running. Follow these instructions to set up the backend server with proper CORS configuration.

## Prerequisites

- .NET 6.0 SDK or later installed
- Visual Studio, Visual Studio Code, or command line interface

## Setting up the Backend Server

### Option 1: Using Visual Studio

1. Create a new ASP.NET Core Web API project
2. Add SignalR NuGet package:

   ```
   Install-Package Microsoft.AspNetCore.SignalR
   ```

3. Create a ChatHub class in the Hubs folder:

   ```csharp
   using Microsoft.AspNetCore.SignalR;

   namespace SignalRChatApp.Server.Hubs
   {
       public class ChatHub : Hub
       {
           public static readonly Dictionary<string, string> UserConnections = new Dictionary<string, string>();

           public override async Task OnConnectedAsync()
           {
               await base.OnConnectedAsync();
               await Clients.All.SendAsync("UsersUpdated", UserConnections.Keys.ToList());
           }

           public override async Task OnDisconnectedAsync(Exception exception)
           {
               var userId = Context.ConnectionId;
               if (UserConnections.ContainsKey(userId))
               {
                   UserConnections.Remove(userId);
               }
               await Clients.All.SendAsync("UsersUpdated", UserConnections.Keys.ToList());
               await base.OnDisconnectedAsync(exception);
           }

           public async Task RegisterUser(string userId)
           {
               if (!UserConnections.ContainsValue(userId))
               {
                   UserConnections[Context.ConnectionId] = userId;
                   await Clients.All.SendAsync("UsersUpdated", UserConnections.Values.ToList());
               }
           }

           public async Task SendMessageToUser(string receiverId, string message)
           {
               var senderId = UserConnections[Context.ConnectionId];

               foreach (var kvp in UserConnections)
               {
                   if (kvp.Value == receiverId)
                   {
                       await Clients.Client(kvp.Key).SendAsync("ReceiveMessage", new
                       {
                           sender = senderId,
                           receiver = receiverId,
                           content = message,
                           timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                       });

                       await Clients.Caller.SendAsync("MessageSent", new
                       {
                           success = true,
                           receiver = receiverId,
                           message = message
                       });
                       return;
                   }
               }

               await Clients.Caller.SendAsync("MessageSent", new
               {
                   success = false,
                   receiver = receiverId,
                   error = "User not found"
               });
           }

           public async Task GetOnlineUsers()
           {
               await Clients.Caller.SendAsync("UsersUpdated", UserConnections.Values.ToList());
           }
       }
   }
   ```

4. In Program.cs, add CORS and SignalR configuration:

   ```csharp
   using Microsoft.AspNetCore.Cors;
   using SignalRChatApp.Server.Hubs;

   var builder = WebApplication.CreateBuilder(args);

   // Add services to the container.
   builder.Services.AddControllers();
   builder.Services.AddSignalR();

   // Add CORS
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowAll", policy =>
       {
           policy
               .WithOrigins("http://localhost:3000") // React development server
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); // Important for SignalR
       });
   });

   var app = builder.Build();

   // Configure the HTTP request pipeline.
   if (app.Environment.IsDevelopment())
   {
       app.UseDeveloperExceptionPage();
   }

   app.UseRouting();

   // Enable CORS
   app.UseCors("AllowAll");

   app.MapControllers();
   app.MapHub<ChatHub>("/chathub"); // Maps the hub to /chathub endpoint

   app.Run();
   ```

### Option 2: Using Command Line

1. Create a new directory for your backend:

   ```bash
   mkdir SignalRChatBackend
   cd SignalRChatBackend
   ```

2. Create a new Web API project:

   ```bash
   dotnet new webapi -n SignalRChatApp.Server
   cd SignalRChatApp.Server
   ```

3. Add SignalR package:

   ```bash
   dotnet add package Microsoft.AspNetCore.SignalR
   ```

4. Create the Hubs folder and ChatHub:

   ```bash
   mkdir Hubs
   ```

   Create `Hubs/ChatHub.cs` with the content from Option 1.

5. Update `Program.cs` with the content from Option 1.

6. Run the backend server:
   ```bash
   dotnet run
   ```

## Running Both Servers

1. Start the backend server (by default it will run on https://localhost:7025):

   ```bash
   cd SignalRChatApp.Server
   dotnet run
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd signalrchatapp-frontend
   npm run dev
   ```

## Environment Variables

You can customize the backend URL by setting an environment variable in your `.env` file:

Create a `.env` file in the frontend root directory:

```
REACT_APP_BACKEND_URL=https://localhost:7025/chathub
```

Then restart the frontend server for the changes to take effect.

## Troubleshooting

### CORS Issues

- Make sure the backend server is running
- Verify the CORS policy in the backend allows the frontend origin
- Check that credentials are allowed in the CORS policy for SignalR

### Connection Issues

- Verify that both servers are running
- Check that the URLs in the frontend match the backend endpoints
- Ensure firewall settings aren't blocking the ports
