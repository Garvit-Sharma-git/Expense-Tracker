import { Request, Response } from "express";
import mongoose from "mongoose";
import Group from "../models/group";
import User from "../models/User";
import Expense from "../models/Expense";
import GroupExpense from "../models/GroupExpense";

interface custom extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    friends: string[];
    friendRequests: string[];
    groupIds:string[]
  };
}

export const createGroup = async (req: custom, res: Response):Promise<any> => {
  try {
    const { name, members } = req.body;
    const admin = req.user?.id;

    if (!name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Invalid Group Crendentials" });
    }

    const exisitingGroups = await Group.findOne({name,admin})
    if(exisitingGroups){
      return res.status(400).json({error:"You already have a group with this name"})
    }


    const memberDocs = await User.find({ email: { $in: members } });
    const memberIds = memberDocs.map((user) => user._id);

    const newGroup = new Group({
      name,
      admin,
      members: [admin, ...memberIds],
    });

    await newGroup.save();

    await User.findByIdAndUpdate(admin, { $push: { groupIds: newGroup._id } });

    for (const memberId of memberIds) {
      await User.findByIdAndUpdate(memberId, {
        $push: { groupIds: newGroup._id },
      });
    }

    res
      .status(201)
      .json({ message: "Group create successfully ", group: newGroup });
  } catch (error) {
    res.status(500).json({ error: "Error Creating Group", details: error });
  }
};


export const addMember = async (req: custom, res: Response):Promise<any> => {
  try {
    console.log("Received request body:", req.body);

    const { email, groupId } = req.body;

    if (!email) {
      console.log(" Email is missing!");
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("🔍 Searching for user with email:", email);

    const group = await Group.findById(groupId);

    if (!group) {
      res.status(404).json({ message: " Group not Found " });
    }

    if (group?.admin.toString() !== req.user?.id) {
      return res
        .status(401)
        .json({ message: "You are not the admin of this group" });
    }
    
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      
      return res.status(404).json({ message: "User not found" });
    }

    if (group?.members.includes(user._id as mongoose.Types.ObjectId)) {
      return res
        .status(400)
        .json({ message: "User already exists in the group" });
    }

    group?.members.push(user._id as mongoose.Types.ObjectId);
    await group?.save();
    if (group) {
      await User.findByIdAndUpdate(user._id, {
        $push: { groupIds: group._id },
      });
    }
    res
      .status(200)
      .json({ message: "User added to the group successfully", group });
  } catch (error) {
    res.status(500).json({ error: "Error Adding Member", details: error });
  }
};


export const removeMember = async (req: custom, res: Response) :Promise<any>  => {
  try {
    
    const { email, groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!email) {
      console.log(" Email is missing!");
      return res.status(400).json({ message: "Email is required" });
    }
 
    console.log("removing email",email);

    if (!group) {
      return res.status(404).json({ message: " Group not found " });
    }

    if (group?.admin.toString() !== req.user?.id) {
      return res
        .status(401)
        .json({ message: " You are not the admin of this group " });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res
      .status(404)
      .json({ message: " User not found " });
    }

    if (!group?.members.includes(user._id as mongoose.Types.ObjectId)) {
      return res
        .status(400)
        .json({ message: "User does not exist in the group !!" });
    }

    group.members = group?.members.filter((id) => id.toString() !== (user._id as mongoose.Types.ObjectId).toString()) 
    await group.save();

    await User.findByIdAndUpdate(user._id, { $pull: { groupIds: groupId } });

    res.status(200).json({ message: "Member of this prestigious removed from the group",group });
  } catch (error) {
    res.status(406).json({ error: "Error Removing Member", details: error });
  }
};


export const deleteGroup = async (req:custom , res:Response) :Promise<any>  => {
    try {
        const { groupId} = req.params;
        const group = await Group.findById(groupId);

        if(!group){
          return res.status(404).json({message:"Group not found"});
        }

        if(group.admin.toString() !== req.user?.id){
          return res.status(401).json({message:"You are not the admin of the group"})
        }

        for(const memberId of group.members){
          await User.findByIdAndUpdate(memberId,{$pull:{groupIds:group._id}})
        }

        await Group.deleteOne({_id:groupId}); //id mention kari hai 
        await Expense.deleteMany({groupId:groupId});
        res.status(200).json({message:"Group deleted successfully"});

    } catch (error) {
      res.status(500).json({error:"Error Deleting Group",details:error});
        
    }
}


export const addExpenseToGroup = async (req:custom , res:Response) :Promise<any> => {
  try {
    const {groupId, description, amount, paidBy, splitAmong} = req.body;

    console.log("Received request:", req.body);

    const group = await Group.findById(groupId);

    if(!group){
      return res.status(404).json({message:"Group not found"});
    }

    if(!group.members.includes(req.user?.id as unknown as mongoose.Types.ObjectId)){
      return res.status(401).json({message:"You are not a member of this group"});
    }

    const expense = new GroupExpense({ group: groupId, description, amount, paidBy, splitAmong})
    await expense.save();
    // console.log(expense)

    group.expenses.push(expense._id as mongoose.Types.ObjectId); 
    await group.save();
    
    console.log("Group updated:", group);

    res.status(201).json({message:"Expense added to the group successfully",expense});

  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({error:"Error Adding Expense to Group",details:error});
  }
}


export const getUserGroups = async ( req: custom, res: Response):Promise<any> => {
  try {
    if(!req.user){
      return res.status(401).json({error:"Unauthorized: User not found"})
    }

    const group = await Group.find({ _id: { $in: req.user?.groupIds } })
      .populate("members", "name email")
      .populate({
        path: "expenses",
        model: "GroupExpense",
        select: "description amount paidBy splitAmong date createdAt"
      });
      console.log("Fetched Groups with expenses:", JSON.stringify(group, null, 2));
    // console.log("Fetching groups for user:", req.user.id);
    // console.log("User Group IDs:", req.user.groupIds);

    // const group = await Group.find({ _id: { $in: req.user?.groupIds }}).populate("members", "name email");
    // console.log(req.user?.id);
    // console.log("Fetched Groups:", group);
     
    res.status(201).json({ group });
  } catch (error) {
    console.error("Error Fetching Group:", error);
    res.status(500).json({ error: "Error Fetching Group", details: error });
  }
}

export const getGroupMembers = async ( req:custom , res: Response):Promise<any> => {

  try {
    const {groupId} = req.params

    const group = await Group.findById(groupId).populate("members" , "name email");

    if(!group){
      return res.status(404).json({ message: " Group not found "})
    }

    res.status(200).json({ members: group.members })
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching group members",details: error })
  }
}


// export const settleUpExpense = async ( req:custom,res:Response) => {

//   try {
//     const { groupId, amount , payerEmail, payeeEmail } = req.body;

//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });

//     const payer = await User.findOne({ email : payerEmail });
//     const payee = await User.findOne({ email : payeeEmail });

//     if (!payer || !payee) return res.status(404).json({ message: "User not found" });

//     if (!group.members.includes(payer._id as mongoose.Types.ObjectId) || !group.members.includes(payee._id as mongoose.Types.ObjectId)) {
//       return res.status(400).json({ message: "Payer or Payee not in the group. Both must be in the group. " });
//     }

//     if(!group.balances){
//       group.balances = [];
//     }
//     res.status(200).json({ message: "Expense settled up successfully" });
    
//   } catch (error) {
    
//   }
// }