import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

const addSalary = async (req, res) => {
    try {
        const { employeeId, basicSalary, allowances, deductions, payDate } = req.body;

        // Validate required fields
        if (!employeeId || !basicSalary || !payDate) {
            return res.status(400).json({
                success: false,
                error: "Employee ID, basic salary, and pay date are required"
            });
        }

        // Check if employee exists
        const employee = await Employee.findById(employeeId).populate('department');
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found"
            });
        }

        // Calculate net salary
        const netSalary = parseFloat(basicSalary) + parseFloat(allowances || 0) - parseFloat(deductions || 0);

        // Create new salary record
        const newSalary = new Salary({
            employeeId,
            basicSalary: parseFloat(basicSalary),
            allowances: parseFloat(allowances || 0),
            deductions: parseFloat(deductions || 0),
            netSalary,
            payDate: new Date(payDate)
        });

        const savedSalary = await newSalary.save();

        return res.status(201).json({
            success: true,
            message: "Salary added successfully",
            salary: savedSalary
        });

    } catch (error) {
        console.error('Error adding salary:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in adding salary'
        });
    }
};

const getSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find()
            .populate({
                path: 'employeeId',
                select: 'employeeId dob gender maritalStatus designation status',
                populate: [
                    { path: 'userId', select: 'name email profileImage' },
                    { path: 'department', select: 'dep_name' }
                ]
            })
            .sort({ payDate: -1 });

        // Filter out salaries for resigned employees
        const activeSalaries = salaries.filter(salary => salary.employeeId?.status !== 'resigned');

        return res.status(200).json({
            success: true,
            salaries: activeSalaries
        });

    } catch (error) {
        console.error('Error fetching salaries:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in fetching salaries'
        });
    }
};

const getSalaryById = async (req, res) => {
    try {
        const { id } = req.params;

        const salary = await Salary.findById(id)
            .populate({
                path: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'department', select: 'dep_name' }
                ]
            });

        if (!salary) {
            return res.status(404).json({
                success: false,
                error: "Salary record not found"
            });
        }

        return res.status(200).json({
            success: true,
            salary
        });

    } catch (error) {
        console.error('Error fetching salary:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in fetching salary'
        });
    }
};

const updateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { basicSalary, allowances, deductions, payDate } = req.body;

        // Validate required fields
        if (!basicSalary || !payDate) {
            return res.status(400).json({
                success: false,
                error: "Basic salary and pay date are required"
            });
        }

        // Calculate net salary
        const netSalary = parseFloat(basicSalary) + parseFloat(allowances || 0) - parseFloat(deductions || 0);

        // Update salary record
        const updatedSalary = await Salary.findByIdAndUpdate(
            id,
            {
                basicSalary: parseFloat(basicSalary),
                allowances: parseFloat(allowances || 0),
                deductions: parseFloat(deductions || 0),
                netSalary,
                payDate: new Date(payDate),
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedSalary) {
            return res.status(404).json({
                success: false,
                error: "Salary record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Salary updated successfully",
            salary: updatedSalary
        });

    } catch (error) {
        console.error('Error updating salary:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in updating salary'
        });
    }
};

const deleteSalary = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSalary = await Salary.findByIdAndDelete(id);

        if (!deletedSalary) {
            return res.status(404).json({
                success: false,
                error: "Salary record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Salary deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting salary:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in deleting salary'
        });
    }
};

const getEmployeeSalaries = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Check if user is admin or the employee themselves
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found"
            });
        }

        if (req.user.role !== 'admin' && req.user._id.toString() !== employee.userId.toString()) {
            return res.status(403).json({
                success: false,
                error: "Access denied. You can only view your own salary history."
            });
        }

        const salaries = await Salary.find({ employeeId })
            .populate({
                path: 'employeeId',
                select: 'employeeId',
                populate: [
                    { path: 'userId', select: 'name' },
                    { path: 'department', select: 'dep_name' }
                ]
            })
            .sort({ payDate: -1 });

        return res.status(200).json({
            success: true,
            salaries
        });

    } catch (error) {
        console.error('Error fetching employee salaries:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in fetching employee salaries'
        });
    }
};

export { addSalary, getSalaries, getSalaryById, updateSalary, deleteSalary, getEmployeeSalaries };
