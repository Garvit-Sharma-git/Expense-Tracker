import express from "express";
import authMiddleware  from "../middleware/authMiddleware";
import mongoose from "mongoose";
import {
  createGroup,
  addMember,
  removeMember,
  deleteGroup,
  
  getUserGroups,
  getGroupMembers
  ,downloadGroupHistory,
} from "../controllers/groupController";
import {addExpenseToGroup,minimizeTransactions,settleUpWork,confirmSettlement} from "../controllers/settle"
import Group from "../models/group";

const router = express.Router();

router.post('/create',authMiddleware,createGroup);
router.post('/add-member',authMiddleware,addMember);
router.delete('/remove-member/:groupId/:email',authMiddleware,removeMember);
router.delete("/delete/:groupId", authMiddleware, deleteGroup);

router.get('/user-groups',authMiddleware,getUserGroups);
router.post("/add-expense", authMiddleware, addExpenseToGroup); 

router.get('/group-members/:groupId',authMiddleware,getGroupMembers);


router.post("/settle-up",authMiddleware, settleUpWork);
router.post("/confirm-settlement", authMiddleware, confirmSettlement);

router.get("/download-history/:groupId", authMiddleware, downloadGroupHistory);


export default router;

 