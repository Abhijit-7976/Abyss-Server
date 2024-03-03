import mongoose from "mongoose";

export const connectToDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.DATABASE_URI!
    );
    console.log("✨ Database connected successfully...");
    console.log("   Connection host:", connectionInstance.connection.host);
    console.log("   Connected collection:", connectionInstance.connection.name);
  } catch (err) {
    console.log("❗ Failed to connect to database...");
    if (err instanceof Error) {
      throw err;
    }
  }
};
