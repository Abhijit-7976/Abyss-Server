import { Server } from "socket.io";
import { Room } from "../../models/Room";

export function connectMediasoupService(io: Server) {
  const mediasoupIo = io.of("/mediasoup");

  mediasoupIo.on("connection", socket => {
    console.log("🎥 Mediasoup client connected...");

    socket.on("test", () => {
      console.log("🎥 Mediasoup test event received...");
    });

    socket.on("disconnect", () => {
      console.log("🎥❌ Mediasoup client disconnected...");
    });
  });
}
