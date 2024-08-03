import { kafka } from "./messageClient.kafka.js";

export async function initializeKafka() {
  const admin = kafka.admin();
  admin.connect();
  const existingTopics = await admin.listTopics();
  console.log("Existing Topics:", existingTopics);

  if (existingTopics.includes("messages")) {
    console.log("Topic [messages] already exists");
  } else {
    console.log("Creating Topic [messages]");
    await admin.createTopics({
      topics: [
        {
          topic: "messages",
          numPartitions: 1,
        },
      ],
    });
    console.log("Topic Created Success [messages]");
  }

  await admin.disconnect();
}
