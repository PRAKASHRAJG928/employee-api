import express from 'express'
import { markAttendance, getAttendance, getAttendanceReport, getAllAttendanceForDate } from '../controllers/attendanceController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/mark', authMiddleware, markAttendance)
router.get('/', authMiddleware, getAttendance)
router.get('/report', authMiddleware, getAttendanceReport)
router.get('/all', authMiddleware, getAllAttendanceForDate)

export default router
