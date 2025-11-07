import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectToDatabase from './db/db.js'
import authRouter from './routes/auth.js'
import path from 'path'
import { fileURLToPath } from 'url'
import departmentRouter from './routes/department.js'
import employeeRouter from './routes/employee.js'
import salaryRouter from './routes/salary.js'
import leaveRouter from './routes/leave.js'
import attendanceRouter from './routes/attendance.js'

import './models/User.js'
import './models/Department.js'
import './models/Employee.js'
import './models/Salary.js'
import './models/Leave.js'
import './models/Attendance.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()

const app = express()
app.use(cors({
  origin: 'https://employeefrontend-mu.vercel.app',
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/department', departmentRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/salary', salaryRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/attendance', attendanceRouter)

app.use('/public/uploads', express.static('public/uploads'))

app.get("/", (req, res) => {
  res.send("✅ Employee API backend running successfully!");
});

connectToDatabase()

export default app
