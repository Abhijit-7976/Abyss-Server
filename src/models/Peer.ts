import { Consumer } from "mediasoup/node/lib/Consumer";
import { Producer } from "mediasoup/node/lib/Producer";
import { Transport } from "mediasoup/node/lib/Transport";

export class Peer {
  public id: string;
  public producerTransports: Map<string, Transport>;
  public consumerTransports: Map<string, Transport>;
  public producers: Map<string, Producer>;
  public consumers: Map<string, Consumer>;

  constructor(socketId: string) {
    this.id = socketId;
    this.producerTransports = new Map();
    this.consumerTransports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
  }

  public addTransport(
    transport: Transport,
    consumer: boolean = false,
    peerId: string = ""
  ) {
    if (consumer) {
      this.consumerTransports.set(peerId, transport);
    } else {
      this.producerTransports.set(transport.id, transport);
    }
  }

  public addProducer(producer: Producer) {
    this.producers.set(producer.id, producer);
  }

  public addConsumer(consumer: Consumer) {
    this.consumers.set(consumer.id, consumer);
  }
}
