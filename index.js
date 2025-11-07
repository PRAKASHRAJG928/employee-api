import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToDatabase from "./db/db.js";
import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import salaryRouter from "./routes/salary.js";
import leaveRouter from "./routes/leave.js";
import attendanceRouter from "./routes/attendance.js";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// Import models (ensure they're registered)
import "./models/User.js";
import "./models/Department.js";
import "./models/Employee.js";
import "./models/Salary.js";
import "./models/Leave.js";
import "./models/Attendance.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ Middleware
app.use(
  cors({
    origin: ["https://employeefrontend-mu.vercel.app", "http://localhost:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);
app.use(express.json());

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    console.log('Health check requested');
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
    });
    
    const dbStatus = await connectToDatabase();
    res.json({ 
      status: 'ok',
      message: '✅ Employee API backend running successfully!',
      dbConnection: dbStatus ? 'connected' : 'disconnected',
      env: process.env.NODE_ENV || 'not set',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Backend error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Non-sensitive environment status endpoint (does NOT expose secrets)
app.get('/api/envs', (req, res) => {
  try {
    res.json({
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Env status error:', err);
    res.status(500).json({ error: 'Could not read env status' });
  }
});

// ✅ Static files (if needed)
app.use("/public/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ API routes
app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/attendance", attendanceRouter);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ Employee API backend running successfully!");
});

// ❌ Don't use app.listen()
// ✅ Export for Vercel
export default serverless(app);
