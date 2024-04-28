import { Server } from "socket.io";

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
