
import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");
} catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Note: In serverless environment, do not exit process
}
};

export default connectToDatabase;
