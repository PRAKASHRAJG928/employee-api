import multer from "multer"
import path from "path"
import Employee from "../models/Employee.js"
import User from "../models/User.js"
import Leave from "../models/Leave.js"
import Salary from "../models/Salary.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "public/uploads")
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

const addEmployee = async (req, res) => {
    try{
        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            password,
            role,
        } = req.body;

        // Validation
        if (!department || department === '') {
            return res.status(400).json({success: false, error: 'Department is required'})
        }

        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(409).json({success: false, error: 'User already registered'})
        }
        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            name,
            email,
            password: hashPassword,
            role,
            profileImage: req.file ? req.file.filename : "https://i.pinimg.com/564x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg"
        })
        const savedUser = await newUser.save()
        const newEmployee = new Employee({
            userId: savedUser._id,
            employeeId,
            dob,
            gender,
            maritalStatus,
            department,
            designation,
            salary,
        })

        await newEmployee.save()
        return res.status(201).json({success: true, message: 'Employee created'})

    }catch(error){
        console.error('Error adding employee:', error)
        return res.status(500).json({success: false, message: 'Server error in adding employee'})
    }
}


const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ status: { $ne: 'resigned' } }).populate('userId').populate('department')
        return res.status(200).json({ success: true, employees })
    } catch (error) {
        return res.status(500).json({ success: false, error: "get Employees server error" })
    }
}

  const getEmployee = async (req, res) => {
    try {
        const {id} = req.params

        // Check if user is admin or the employee themselves
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ success: false, error: "Access denied. You can only view your own profile." })
        }

        const employee = await Employee.findById(id).populate('userId').populate('department')
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" })
        }
        return res.status(200).json({ success: true, employee })
    } catch (error) {
        return res.status(500).json({ success: false, error: "get Employee server error" })
    }
}



const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params
        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            password,
            role,
        } = req.body;

        console.log('Update request for employee ID:', id)
        console.log('Request body:', req.body)

        let employee;
        let user;

        if (id) {
            // Admin updating specific employee
            employee = await Employee.findById(id)
            if (!employee) {
                return res.status(404).json({ success: false, error: "Employee not found" })
            }
            user = await User.findById(employee.userId)
        } else {
            // Employee updating their own profile
            user = req.user
            employee = await Employee.findOne({ userId: user._id })
            if (!employee) {
                return res.status(404).json({ success: false, error: "Employee record not found" })
            }
        }

        // Validation for admin updates
        if (id && (!department || department === '')) {
            return res.status(400).json({success: false, error: 'Department is required'})
        }

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Name is required' })
        }
        if (!email || email.trim() === '') {
            return res.status(400).json({ success: false, error: 'Email is required' })
        }

        // Update user fields
        user.name = name.trim()
        const trimmedEmail = email.trim()
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email: trimmedEmail, _id: { $ne: user._id } })
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already in use' })
        }
        user.email = trimmedEmail
        if (req.file) user.profileImage = req.file.filename

        // Only allow role and password updates for admin updates
        if (id) {
            if (role) user.role = role
            if (password) {
                const hashPassword = await bcrypt.hash(password, 10)
                user.password = hashPassword
            }
        }

        await user.save()

        // Update employee fields
        if (dob) {
            const date = new Date(dob)
            if (isNaN(date.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid date of birth' })
            }
            employee.dob = date
        }
        if (gender) employee.gender = gender
        if (maritalStatus) employee.maritalStatus = maritalStatus

        // Only allow admin fields for admin updates
        if (id) {
            if (employeeId) employee.employeeId = employeeId
            if (designation) employee.designation = designation
            if (department) employee.department = department
            if (salary) employee.salary = salary
        }

        await employee.save()

        return res.status(200).json({ success: true, message: 'Employee updated successfully' })

    } catch (error) {
        console.error('Error updating employee:', error)
        console.error('Error details:', error.message)
        console.error('Error stack:', error.stack)
        return res.status(500).json({ success: false, message: 'Server error in updating employee' })
    }
}

const deleteEmployee = async (req, res) => {
    try {
        const {id} = req.params
        const employee = await Employee.findById(id)
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" })
        }

        // Cascade delete related records
        await Leave.deleteMany({ employeeId: id })
        await Salary.deleteMany({ employeeId: id })

        // Delete the employee
        await Employee.findByIdAndDelete(id)

        // Delete the associated user
        await User.findByIdAndDelete(employee.userId)

        return res.status(200).json({ success: true, message: "Employee and all related details deleted successfully" })
    } catch (error) {
        console.error('Error deleting employee:', error)
        return res.status(500).json({ success: false, error: "delete Employee server error" })
    }
}

export {addEmployee, upload, getEmployees, getEmployee, updateEmployee, deleteEmployee}
