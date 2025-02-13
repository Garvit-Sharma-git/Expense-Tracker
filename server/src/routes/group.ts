import express from "express";
import authMiddleware  from "../middleware/authMiddleware";
import {
  createGroup,
  addMember,
  removeMember,
  deleteGroup,
  addExpenseToGroup,
  getUserGroups,
  
} from "../controllers/groupController";

const router = express.Router();

router.post('/create',authMiddleware,createGroup);
router.post('/add-member',authMiddleware,addMember);
router.post('/remove-member',authMiddleware,removeMember);
router.delete("/delete/:groupId", authMiddleware, deleteGroup);

router.get('/user-groups',authMiddleware,getUserGroups);
router.post("/add-expense", authMiddleware, addExpenseToGroup);

export default router;

