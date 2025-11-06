import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import axios from 'axios'

const addLeave = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, description } = req.body;
        const userId = req.user._id; // authMiddleware sets req.user with _id

        // Validate required fields
        if (!leaveType || !fromDate || !toDate || !description) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // Validate dates
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const today = new Date();

        if (from > to) {
            return res.status(400).json({
                success: false,
                error: "From date cannot be after to date"
            });
        }

        if (from < today.setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                success: false,
                error: "Cannot apply leave for past dates"
            });
        }

        // Find employee by userId
        const employee = await Employee.findOne({ userId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found"
            });
        }

        // Create new leave request
        const newLeave = new Leave({
            employeeId: employee._id,
            leaveType,
            fromDate: from,
            toDate: to,
            description
        });

        const savedLeave = await newLeave.save();

        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            leave: savedLeave
        });

    } catch (error) {
        console.error('Error adding leave:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in adding leave'
        });
    }
};

const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate({
                path: 'employeeId',
                select: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name email profileImage' },
                    { path: 'department', select: 'dep_name' }
                ]
            })
            .sort({ appliedDate: -1 });

        return res.status(200).json({
            success: true,
            leaves
        });

    } catch (error) {
        console.error('Error fetching leaves:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in fetching leaves'
        });
    }
};

const getLeaveById = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findById(id)
            .populate({
                path: 'employeeId',
                select: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name email profileImage' },
                    { path: 'department', select: 'dep_name' }
                ]
            });

        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found"
            });
        }

        return res.status(200).json({
            success: true,
            leave
        });

    } catch (error) {
        console.error('Error fetching leave:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in fetching leave'
        });
    }
};

const updateLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedBy } = req.body;

        const updateData = { status };
        if (status === 'approved' || status === 'rejected') {
            updateData.approvedBy = approvedBy;
            updateData.approvedDate = new Date();
        }

        const updatedLeave = await Leave.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedLeave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Leave request updated successfully",
            leave: updatedLeave
        });

    } catch (error) {
        console.error('Error updating leave:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in updating leave'
        });
    }
};

const deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedLeave = await Leave.findByIdAndDelete(id);

        if (!deletedLeave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Leave request deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting leave:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in deleting leave'
        });
    }
};

const getEmployeeLeaves = async (req, res) => {
    try {
        const userId = req.user._id; // authMiddleware sets req.user with _id

        // Find employee by userId
        const employee = await Employee.findOne({ userId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found"
            });
        }

        const leaves = await Leave.find({ employeeId: employee._id })
            .populate({
                path: 'employeeId',
                select: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name email profileImage' },
                    { path: 'department', select: 'dep_name' }
                ]
            })
            .sort({ appliedDate: -1 });

        return res.status(200).json({
            success: true,
            leaves
        });

    } catch (error) {
        console.error('Error fetching employee leaves:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in fetching employee leaves'
        });
    }
};

export { addLeave, getLeaves, getLeaveById, updateLeave, deleteLeave, getEmployeeLeaves };
