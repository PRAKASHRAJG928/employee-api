import Attendance from '../models/Attendance.js'

const markAttendance = async (req, res) => {
    try {
        const { employeeId, date, status } = req.body

        // Check if attendance already exists for this employee on this date
        const existingAttendance = await Attendance.findOne({
            employeeId,
            date: new Date(date)
        })

        if (existingAttendance) {
            // Update existing attendance
            existingAttendance.status = status
            await existingAttendance.save()
            res.json({ success: true, message: 'Attendance updated successfully' })
        } else {
            // Create new attendance record
            const newAttendance = new Attendance({
                employeeId,
                date: new Date(date),
                status
            })
            await newAttendance.save()
            res.json({ success: true, message: 'Attendance marked successfully' })
        }
    } catch (error) {
        console.error('Error marking attendance:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

const getAttendance = async (req, res) => {
    try {
        const { employeeId, date } = req.query

        const attendance = await Attendance.findOne({
            employeeId,
            date: new Date(date)
        })

        if (attendance) {
            res.json({ success: true, attendance })
        } else {
            res.json({ success: false, message: 'No attendance found' })
        }
    } catch (error) {
        console.error('Error fetching attendance:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

const getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query

        let query = {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }

        if (employeeId) {
            query.employeeId = employeeId
        }

        const attendanceRecords = await Attendance.find(query)
            .populate({
                path: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name' },
                    { path: 'department', select: 'dep_name' }
                ],
                select: 'employeeId'
            })
            .sort({ date: 1 })

        res.json({ success: true, attendance: attendanceRecords })
    } catch (error) {
        console.error('Error fetching attendance report:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

const getAllAttendanceForDate = async (req, res) => {
    try {
        const { date } = req.query

        const attendanceRecords = await Attendance.find({
            date: new Date(date)
        })
            .populate({
                path: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name' },
                    { path: 'department', select: 'dep_name' }
                ],
                select: 'employeeId'
            })
            .sort({ 'employeeId.employeeId': 1 })

        res.json({ success: true, attendance: attendanceRecords })
    } catch (error) {
        console.error('Error fetching all attendance for date:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

export { markAttendance, getAttendance, getAttendanceReport, getAllAttendanceForDate }
