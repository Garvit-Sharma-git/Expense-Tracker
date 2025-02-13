import express from 'express';
import { registerUser, loginUser ,getUser, verifyToken} from '../controllers/authController';
import { createExpense, getExpense,deleteExpense ,updateExpense} from '../controllers/expenseController';
import { sendFriendRequest,  } from '../controllers/friendController';
import authMiddleware from '../middleware/authMiddleware';



const router = express.Router();


router.post('/signup', registerUser);
router.post('/login', loginUser);

router.post('/home' );

router.post('/expenses', authMiddleware,createExpense);
router.get('/expenses', authMiddleware,getExpense);

router.delete('/expenses/:id', deleteExpense);

// router.get('/middleware',authMiddleware)

router.get('/verify-token', verifyToken);

router.post('/freindreq',authMiddleware,sendFriendRequest)

router.put('/expenses/:id',updateExpense)

router.get('/user', authMiddleware, getUser);

export default router;
