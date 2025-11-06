import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addLeave, getLeaves, getLeaveById, updateLeave, deleteLeave, getEmployeeLeaves } from '../controllers/leaveController.js';

const router = express.Router();

router.post('/add', authMiddleware, addLeave);
router.get('/', authMiddleware, getLeaves);
router.get('/:id', authMiddleware, getLeaveById);
router.put('/:id', authMiddleware, updateLeave);
router.delete('/:id', authMiddleware, deleteLeave);
router.get('/employee/me', authMiddleware, getEmployeeLeaves);

export default router;
