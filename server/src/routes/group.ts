import express from "express";
import authMiddleware  from "../middleware/authMiddleware";
import {
  createGroup,
  addMember,
  removeMember,
  deleteGroup,
  addExpenseToGroup,
  getUserGroups,
  getGroupMembers,
  
} from "../controllers/groupController";

const router = express.Router();

router.post('/create',authMiddleware,createGroup);
router.post('/add-member',authMiddleware,addMember);
router.delete('/remove-member/:groupId/:email',authMiddleware,removeMember);
router.delete("/delete/:groupId", authMiddleware, deleteGroup);

router.get('/user-groups',authMiddleware,getUserGroups);
router.post("/add-expense", authMiddleware, addExpenseToGroup);

router.get('/group-members/:groupId',authMiddleware,getGroupMembers);

export default router;

