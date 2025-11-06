import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addEmployee, upload, getEmployees, getEmployee, updateEmployee, deleteEmployee} from '../controllers/employeeController.js'


const router = express.Router()

router.get('/', authMiddleware, getEmployees)
router.get('/:id', authMiddleware, getEmployee)
router.post('/add', authMiddleware,upload.single('image'), addEmployee)
router.put('/profile', authMiddleware, upload.single('image'), updateEmployee)
router.put('/:id', authMiddleware, upload.single('image'), updateEmployee)
router.delete('/:id', authMiddleware, deleteEmployee)


export default router




