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

// ✅ Middleware
app.use(
  cors({
    origin: "https://employeefrontend-mu.vercel.app", // frontend URL (no trailing slash)
    credentials: true,
  })
);
app.use(express.json());

// ✅ Connect to MongoDB
await connectToDatabase();

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
