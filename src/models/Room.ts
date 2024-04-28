import { Router, RtpCapabilities, Worker } from "mediasoup/node/lib/types";
import { config } from "../config/mediasoup";
import { Peer } from "./Peer";

export class Room {
  public peers: Map<string, Peer>;

  constructor(public roomId: number, public router: Router) {
    this.peers = new Map();
  }

  // Class builder for handling the creation of a new Room instance with async/await
  public static async builder(roomId: number, worker: Worker) {
    const router = await worker.createRouter(config.mediasoup.routerOptions);
    return new Room(roomId, router);
  }

  getRtpCapabilities() {
    return this.router.rtpCapabilities;
  }

  addPeer(socketId: string) {
    console.log("Peer joined the room:", socketId);
    this.peers.set(socketId, new Peer(socketId));
  }

  canConsumeProducer(
    peerProducerId: string,
    deviceRtpCapabilities: RtpCapabilities
  ) {
    return this.router.canConsume({
      producerId: peerProducerId,
      rtpCapabilities: deviceRtpCapabilities,
    });
  }

  createWebRTCTransport = async (
    socketId: string,
    consumer: boolean = false,
    peerId: string = ""
  ) => {
    const { maxIncomingBitrate, initialAvailableOutgoingBitrate } =
      config.mediasoup.webRtcTransportOptions;

    const transport = await this.router.createWebRtcTransport({
      listenInfos: config.mediasoup.webRtcTransportOptions.listenInfos,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    });

    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (error) {
        console.error(error);
      }
    }

    transport.on("dtlsstatechange", dtlsState => {
      if (dtlsState === "closed") {
        console.log("WebRTC transport closed:", transport.id);
        transport.close();
      }
    });

    transport.observer.on("close", () => {
      console.log("WebRTC transport closed:", transport.id);
    });

    console.log("Created a new WebRTC transport:", transport.id);

    if (!consumer) this.peers.get(socketId)!.addTransport(transport);
    else this.peers.get(socketId)!.addTransport(transport, consumer, peerId);

    return {
      transport,
      transportParams: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    };
  };
}
