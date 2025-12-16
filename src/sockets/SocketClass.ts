import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export class SocketClass {
  private io: Server | null = null;
  private connectedUsers: Record<string, string> = {};

  public initializeServer(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("A user connected:", socket.id);

      // frontend sends: join-room, roomName
      socket.on("join-room", (roomName: string) => {
        console.log(`Socket ${socket.id} joining room: ${roomName}`);
        socket.join(roomName);
      });

      socket.on("leave-room", (roomName: string) => {
        console.log(`Socket ${socket.id} leaving room: ${roomName}`);
        socket.leave(roomName);
      });

      socket.on("join", (userId) => {
        this.connectedUsers[userId] = socket.id;
        console.log("connected users: ", this.connectedUsers);
      });
      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });

      socket.on("chat-message", ({ room, message }) => {
        socket.to(room).emit("chat-message", message);
      });

      socket.on("new-loan-application", room => {
        socket.to(room).emit("notifyUser", "You have a new message")
      });


      socket.on("loan-progress-update", room => {
        socket.to(room).emit("loanProgressUpdate", "You have a new message")
      })

      
      socket.on("loan-update", userId => {
        console.log({userId})
        const userSocketId = this.connectedUsers[userId];
        console.log({userSocketId})
        socket.to(userSocketId).emit("notifyCreditOfficer", "You have a new message")
      })
    });

    this.io?.on("connection", (socket) => {
      socket.onAny((event, ...args) => {
        console.log(`Socket ${socket.id} received event:`, event, args);
      });
    });
    
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.io not initialized");
    }
    return this.io;
  }
}
