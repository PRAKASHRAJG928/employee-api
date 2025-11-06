import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addSalary, getSalaries, getSalaryById, updateSalary, deleteSalary, getEmployeeSalaries } from '../controllers/salaryController.js';

const router = express.Router();

router.post('/add', authMiddleware, addSalary);
router.get('/', authMiddleware, getSalaries);
router.get('/:id', authMiddleware, getSalaryById);
router.put('/:id', authMiddleware, updateSalary);
router.delete('/:id', authMiddleware, deleteSalary);
router.get('/employee/:employeeId', authMiddleware, getEmployeeSalaries);

export default router;
