import {
  RtpCodecCapability,
  TransportListenInfo,
  WorkerLogTag,
} from "mediasoup/node/lib/types";
import os from "os";

const ifaces = os.networkInterfaces();

const getLocalIp = () => {
  let localIp = "127.0.0.1";
  let checkIp = true;
  Object.keys(ifaces).forEach(ifname => {
    for (const iface of ifaces[ifname]!) {
      // Ignore IPv6 and 127.0.0.1
      if (
        iface.family !== "IPv4" ||
        iface.internal !== false ||
        checkIp === false
      ) {
        continue;
      }
      // Set the local ip to the first IPv4 address found and exit the loop
      localIp = iface.address;
      checkIp = false;
      return;
    }
  });
  return localIp;
};

export const config = {
  // listenIp: "0.0.0.0",
  // listenPort: 8000,

  mediasoup: {
    numWorkers: Object.keys(os.cpus()).length, // Use as many CPUs as available.

    workerSettings: {
      rtcMinPort: process.env.MEDIASOUP_MIN_PORT || 10000,
      rtcMaxPort: process.env.MEDIASOUP_MAX_PORT || 10100,
      logLevel: "debug",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"] as WorkerLogTag[],
      // logTags: ["ice"] as WorkerLogTag[],
    },

    routerOptions: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {
            "profile-id": 2,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "4d0032",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
      ] as RtpCodecCapability[],
    },

    webRtcTransportOptions: {
      listenInfos: [
        {
          protocol: "udp",
          ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP || getLocalIp(),
        },
        {
          protocol: "tcp",
          ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP || getLocalIp(),
        },
      ] as TransportListenInfo[],
      initialAvailableOutgoingBitrate: 1000000,
      maxIncomingBitrate: 1500000,
    },
  },
} as const;
