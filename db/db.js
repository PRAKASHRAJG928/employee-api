
import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Already connected to MongoDB");
      return true;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log("✅ Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error; // Propagate error to be handled by global error handler
  }
};

export default connectToDatabase;
