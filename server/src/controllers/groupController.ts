import { Request, Response } from "express";
import mongoose from "mongoose";
import Group from "../models/group";
import User from "../models/User";

import GroupExpense from "../models/GroupExpense";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";


interface custom extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    friends: string[];
    friendRequests: string[];
    groupIds: string[];
  };
}

export const createGroup = async (req: custom, res: Response): Promise<any> => {
  try {
    const { name, members } = req.body;
    const admin = req.user?.id;

    if (!name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Invalid Group Crendentials" });
    }

    const exisitingGroups = await Group.findOne({ name, admin });
    if (exisitingGroups) {
      return res
        .status(400)
        .json({ error: "You already have a group with this name" });
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

export const addMember = async (req: custom, res: Response): Promise<any> => {
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

export const removeMember = async (
  req: custom,
  res: Response
): Promise<any> => {
  try {
    const { email, groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!email) {
      console.log(" Email is missing!");
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("removing email", email);

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
      return res.status(404).json({ message: " User not found " });
    }

    if (!group?.members.includes(user._id as mongoose.Types.ObjectId)) {
      return res
        .status(400)
        .json({ message: "User does not exist in the group !!" });
    }

    group.members = group?.members.filter(
      (id) => id.toString() !== (user._id as mongoose.Types.ObjectId).toString()
    );
    await group.save();

    await User.findByIdAndUpdate(user._id, { $pull: { groupIds: groupId } });

    res
      .status(200)
      .json({
        message: "Member of this prestigious removed from the group",
        group,
      });
  } catch (error) {
    res.status(406).json({ error: "Error Removing Member", details: error });
  }
};

export const deleteGroup = async (req: custom, res: Response): Promise<any> => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== req.user?.id) {
      return res
        .status(401)
        .json({ message: "You are not the admin of the group" });
    }

    for (const memberId of group.members) {
      await User.findByIdAndUpdate(memberId, {
        $pull: { groupIds: group._id },
      });
    }

    await Group.deleteOne({ _id: groupId }); //id mention kari hai
    await GroupExpense.deleteMany({ groupId: groupId });
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error Deleting Group", details: error });
  }
};

// export const addExpenseToGroup = async (
//   req: custom,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { groupId, description, amount, paidBy, splitAmong, splitDetails } = req.body;
//     const Amount =Number(amount)
//     console.log({ groupId, description, amount, paidBy, splitAmong, splitDetails })
    
//     // console.log("split details",splitDetails )
//     // console.log("Received request:", req.body);

//     const group = await Group.findById(groupId);
//     // console.log("add ka group",group);

//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     if (
//       !group.members.includes(
//         req.user?.id as unknown as mongoose.Types.ObjectId
//       )
//     ) {
//       return res
//         .status(401)
//         .json({ message: "You are not a member of this group" });
//     }

//     if(!Array.isArray(splitDetails)){
//       return res.status(400).json({message:"invalid split details format"})

//     }
//     const totalSplitAmount = splitDetails.reduce(( sum:number , detail: {amount:number}) => sum + detail.amount , 0)
//     console.log("total split and amount:", totalSplitAmount, Amount)
//     if(totalSplitAmount !== Amount){
//       return res.status(400).json({ message: "Total split amounts do not match expense amount" });
//     }
  
//     const expense = new GroupExpense({
//       group: groupId,
//       description,
//       amount,
//       paidBy,
//       splitAmong,
//       splitDetails,
//     });
//     await expense.save();
//     // console.log(expense)

//     group.expenses.push(expense._id as mongoose.Types.ObjectId);
//     console.log("Group updated:", group);

//     await group.save();

//     await recalculateBalances(groupId);
    
//     res
//       .status(201)
//       .json({ message: "Expense added to the group successfully", expense });
//   } catch (error) {
//     console.error("Error adding expense:", error);
//     res
//       .status(500)
//       .json({ error: "Error Adding Expense to Group", details: error });
//   }
// };

export const getUserGroups = async (
  req: custom,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const group = await Group.find({ _id: { $in: req.user?.groupIds } })
      .populate("members", "name email")
      .populate({
        path: "expenses",
        model: "GroupExpense",
        select: "description amount paidBy splitAmong date createdAt",
      });
    // console.log(
    //   "Fetched Groups with expenses:",
    //   JSON.stringify(group, null, 2)
    // );
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
};

export const getGroupMembers = async (
  req: custom,
  res: Response
): Promise<any> => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "members",
      "name email"
    );

    if (!group) {
      return res.status(404).json({ message: " Group not found " });
    }

    

    res.status(200).json({ members: group.members });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching group members", details: error });
  }
};

//
// const recalculateBalances = async (groupId: string) => {

//   console.log("RECALCULATE BALANCES  hai ye")


//   const group = await Group.findById(groupId).populate({
//     path: "expenses",
//     populate:[{
//       path: "paidBy",
//       select: "_id name",
//     },
//     {
//       path:"splitDetails.user", select:"_id name"
//     }
//   ],
//   });


//   if (!group) throw new Error("Group not found");

//   const totalPaid: Record<string, number> = {};
//   const totalShare: Record<string, number> = {};
//   const settledAmounts: Record<string, number> = {}; // Track settled amounts

//   // Initialize balances
//   group.members.forEach((member) => {
//     totalPaid[member.toString()] = 0;
//     totalShare[member.toString()] = 0;
//     settledAmounts[member.toString()] = 0; // Initialize settled amounts
//   });

//   for (const expense of group.expenses as any[]) {
    
//     const paidById = (expense.paidBy as { _id: mongoose.Types.ObjectId })._id.toString();
    
//     console.log("total paid by id",totalPaid[paidById]);
//     console.log("expense amount",expense.amount);
    
    
//     totalPaid[paidById] += expense.amount;

//     console.log("total paid by id after formula",totalPaid[paidById]);

//     for (const detail of expense.splitDetails) {
      
//       const userId = (detail.user as { _id: mongoose.Types.ObjectId })._id.toString();
//       console.log( "total share by id",totalShare[userId]);
//       console.log("detail amount",detail.amount);
      
//       totalShare[userId] = (totalShare[userId] || 0) + detail.amount;
//       console.log( "total share by id after formula",totalShare[userId]);
//     }
    
//   }
//   console.log("group settlemets ",group.settlements);
  
//   if (group.settlements) {
//     for (const settlement of group.settlements) {
//       const fromId = settlement.from.toString();
//       const toId = settlement.to.toString();

//       console.log("settled amount",settledAmounts[fromId]);
//       console.log("settled amount",settledAmounts[toId]); 

//       settledAmounts[fromId] = (settledAmounts[fromId] || 0) + settlement.amount;
//       settledAmounts[toId] = (settledAmounts[toId] || 0) - settlement.amount;
//     }  
//   }


//   const netBalances: Record<string, number> = {};
//   Object.keys(totalPaid).forEach((userId) => { 
//     netBalances[userId] = totalPaid[userId] - totalShare[userId] - (settledAmounts[userId] || 0);
//   });

// console.log("net balances hai ye: ",netBalances)
 
//   group.balances = Object.keys(netBalances).map((userId) => ({
//     user: new mongoose.Types.ObjectId(userId) as any,
//     amount: netBalances[userId],
//   }));
  
//   console.log("group  ",group);
 
//   await group.save();
// };

// interface Balance {
//   user: mongoose.Types.ObjectId;
//   amount: number;
//   name: string;
// }

// interface Settlement {
//   from: string;
//   fromName: string;
//   to: string;
//   toName: string;
//   amount: number;
// }


// export const settleUpWork = async (req:custom,res:Response):Promise<any> => {
//   try {
//     console.log("SETTLEUP WORK hai ye")
//       const { groupId } = req.body;
//       console.log("Received groupId:", groupId);


//       const group = await Group.findById(groupId).populate({
//         path: "balances.user",
//         select: "name",
//         model: "User"
//       })
//       console.log("Fetched Group:", group);

//       // console.log("group hanji settleup work me hu me ",group?.name);
//       // console.log("user ki info :",req.user)
      
  
//       if (!group) return res.status(404).json({ message: "Group not found" });

//       type populatedBalance ={
//         user:{
//           _id: mongoose.Types.ObjectId;
//           name: string;
//         };
//         amount: number;
//         }
      

//       const balances : populatedBalance[] = group.balances as unknown as populatedBalance[];
//       console.log("Group Balances:", group.balances);

   
//       const formattedBalances = balances.map((b) => ({
//         user: new mongoose.Types.ObjectId(b.user._id.toString()),
//         name: b.user.name,
//         amount: b.amount,
//       }));

//       console.log("Formatted Balances for Settlement:", formattedBalances);

//       const settlements = minimizeTransactions(formattedBalances);
       

//       // console.log("user ki info :",req.user?.name)

//       group.settlements = settlements.map((s) => ({
//         from: new mongoose.Types.ObjectId(s.from),
//         to: new mongoose.Types.ObjectId(s.to),
//         amount: s.amount,
//       }));
  
//       await group.save();

//     res.json({ settlements });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
// }


// export const minimizeTransactions = (balances: Balance[]): Settlement[] => {
//   console.log("MINIMIZE TRANSACTIONS  hai ye")
//   const creditors: Balance[] = [];
//   const debtors: Balance[] = [];

//   console.log("Creditors:", creditors);
// console.log("Debtors:", debtors);


//   for (const { user,name, amount } of balances) {
//     if (amount > 0) creditors.push({ user,name, amount });
//     else if (amount < 0) debtors.push({ user,name, amount: -amount });
//   }

//   const settlements: Settlement[] = [];

//   while (creditors.length > 0 && debtors.length > 0) {
//     const creditor = creditors[0];
//     const debtor = debtors[0];

//     const settledAmount = Math.min(creditor.amount, debtor.amount);

//     console.log("ye dkhoooo",debtor.user)

//     settlements.push({
//       from: debtor.user.toString(),
//       fromName:debtor.name,
//       to:  creditor.user.toString(),
//       toName:creditor.name,
//       amount: settledAmount,
//     });

//     creditor.amount -= settledAmount;
//     debtor.amount -= settledAmount;

//     if (creditor.amount === 0) creditors.shift();
//     if (debtor.amount === 0) debtors.shift();
//   }
//   console.log("Generated Settlements:", settlements);


//   return settlements;
// };


// export const confirmSettlement = async (req: custom, res: Response): Promise<any> => {
//   try {
//     console.log("CONFIRM SETTLEMENTS hai ye")
//     console.log("Received settlement request:", req.body);

//     let { groupId, fromUserId, toUserId, amount } = req.body;

//     if (!groupId || !fromUserId || !toUserId || amount <= 0) {
//       return res.status(400).json({ message: "Invalid settlement request" });
//     }

//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     const fromUserIdStr = fromUserId.toString(); 
//     const toUserIdStr = toUserId.toString();

//     let fromBalance = group.balances.find((b) => b.user.toString() === fromUserIdStr);
//     let toBalance = group.balances.find((b) => b.user.toString() === toUserIdStr);

//     if (!fromBalance || !toBalance) {
//       return res.status(400).json({ message: "User balances not found" });
//     }

//     console.log(`Before Settlement -> From: ${fromBalance.amount}, To: ${toBalance.amount}`);
//     console.log(`Settlement Request Amount: ${amount}`);

//     if(fromBalance.amount === 0 && toBalance.amount === 0){
//       amount = 0;
//     }

//     // **Fix: Convert everything to numbers to avoid type issues**
//     amount = Number(amount);
//     fromBalance.amount = Number(fromBalance.amount);
//     toBalance.amount = Number(toBalance.amount);

//     console.log(`Converted Values -> From: ${fromBalance.amount}, To: ${toBalance.amount}, Amount: ${amount}`);

//     // **Fix: Prevent floating-point precision errors by rounding**
//     const fromBalanceRounded = Math.round(fromBalance.amount * 100) / 100;
//     const toBalanceRounded = Math.round(toBalance.amount * 100) / 100;
//     const amountRounded = Math.round(amount * 100) / 100;

//     console.log(`Rounded Values -> From: ${fromBalanceRounded}, To: ${toBalanceRounded}, Amount: ${amountRounded}`);

//     // **Fix: Ensure settlement amount does not exceed owed balance**
//     // if (Math.abs(fromBalanceRounded) < amountRounded) {
//     //   return res.status(400).json({ message: "Amount exceeds due balance",details: {from: fromBalanceRounded, amount: amountRounded} });
//     // }

//     // Deduct the settled amount
//     if (fromBalance.amount < 0) {
//       fromBalance.amount += amount; // Reduce the debt
//   } else { 
//       fromBalance.amount -= amount; // Reduce the credit if any
//   }
   
//   // If toUser was supposed to receive, reduce their credit
//   if (toBalance.amount > 0) {
//       toBalance.amount -= amount; // Reduce the credit
//   } else {
//       toBalance.amount += amount; // Reduce the debt if any
//   }
  
//     console.log(`After Settlement -> From: ${fromBalance.amount}, To: ${toBalance.amount}`);
//     console.log("amount 1",amount)

//     if(fromBalance.amount === 0 && toBalance.amount === 0){
//       amount = 0;
//     }
//     console.log("amount 2",amount)

//     // **Ensure balances correctly reach 0 when fully settled**
//     if (Math.abs(fromBalance.amount) < 0.01) fromBalance.amount = 0;
//     if (Math.abs(toBalance.amount) < 0.01) toBalance.amount = 0;

//     console.log("Updated Group Balances:", group.balances);

//     // **Fix: Remove old settlements for the same users**
//     group.settlements = group.settlements.filter(
//       (s) => !(s.from.toString() === fromUserIdStr && s.to.toString() === toUserIdStr)
//     );

//     // **Fix: If all balances are zero, clear all settlements**
//     if (group.balances.every((b) => b.amount === 0)) {
//       group.settlements = [];
//       console.log("All balances settled, clearing past settlements.");
//     }

//     await group.save();

//     res.json({ message: "Settlement confirmed", updatedBalances: group.balances });
//   } catch (error) {
//     console.error("Error processing settlement:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

 
 
// export const downloadGroupHistory = async (req: custom, res: Response): Promise<any> => {
//     try {
//         const { groupId } = req.params;

//         // Fetch group and populate expenses
//         const group = await Group.findById(groupId).populate({
//             path: "expenses", 
//             populate: { path: "paidBy", select: "name" }
//         });

//         if (!group) {
//             return res.status(404).json({ message: "Group not found" });
//         }

//         // Create PDF document
//         const doc = new PDFDocument({ margin: 30 });
//         const fileName = `group-history-${groupId}.pdf`;
//         const filePath = path.join(__dirname, ".././public", fileName);

//         doc.pipe(fs.createWriteStream(filePath)); // Save file to server
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
//         doc.pipe(res);

//         // Title 
//         doc.fontSize(20).text(`Transaction History for ${group.name}`, { align: "center" });
//         doc.moveDown(2);

//         // Draw Table Headers
//         const startX = 50;
//         const startY = 120;
//         const rowHeight = 30;
//         const colWidths = [50, 200, 100, 150]; 

//         doc.font("Helvetica-Bold");
//         doc.text("#", startX, startY, { width: colWidths[0], align: "left" });
//         doc.text("Description", startX + colWidths[0], startY, { width: colWidths[1], align: "left" });
//         doc.text("Amount", startX + colWidths[0] + colWidths[1], startY, { width: colWidths[2], align: "right" });
//         doc.text("Paid By", startX + colWidths[0] + colWidths[1] + colWidths[2], startY, { width: colWidths[3], align: "left" });
        
//         // Draw a separator line
//         doc.moveTo(startX, startY + rowHeight - 5).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + rowHeight - 5).stroke();

//         // Add transactions as table rows
//         doc.font("Helvetica");
//         group.expenses.forEach((expense: any, index: number) => {
//             const rowY = startY + rowHeight * (index + 1);

//             doc.text(`${index + 1}`, startX, rowY, { width: colWidths[0], align: "left" });
//             doc.text(expense.description, startX + colWidths[0], rowY, { width: colWidths[1], align: "left" });
//             doc.text(`₹${expense.amount.toFixed(2)}`, startX + colWidths[0] + colWidths[1], rowY, { width: colWidths[2], align: "right" });
//             doc.text(expense.paidBy.name, startX + colWidths[0] + colWidths[1] + colWidths[2], rowY, { width: colWidths[3], align: "left" });

//             // Draw a separator line between rows
//             doc.moveTo(startX, rowY + rowHeight - 5).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), rowY + rowHeight - 5).stroke();
//         });

//         // Finalize PDF
//         doc.end();
//     } catch (error) {
//         console.error("Error generating PDF:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

export const downloadGroupHistory = async (req: custom, res: Response): Promise<any> => {
  try {
      const { groupId } = req.params;

      // Fetch group and populate expenses
      const group = await Group.findById(groupId).populate({
          path: "expenses", 
          populate: { path: "paidBy", select: "name" }
      });

      if (!group) {
          return res.status(404).json({ message: "Group not found" });
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const fileName = `group-history-${groupId}.pdf`;
      const filePath = path.join(__dirname, ".././public", fileName);

      doc.pipe(fs.createWriteStream(filePath)); // Save file to server
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      doc.pipe(res);

      // Title Section
      doc.font("Helvetica-Bold").fontSize(22).fillColor("#1f487e")
         .text(`Transaction History`, { align: "center" });

      doc.moveDown(0.5);
      doc.fontSize(16).fillColor("#000").text(`Group: ${group.name}`, { align: "center" });
      doc.fontSize(12).fillColor("#555")
         .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });

      doc.moveDown(2);

      // Adjusted Column Widths for Better Spacing
      const startX = 40;
      const startY = 160;
      const rowHeight = 30;
      const colWidths = [40, 100, 120, 220]; // Adjusted for proper spacing

      // Draw header background
      doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
         .fill("#1f487e");

      // Set header text
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(12);
      doc.text("#", startX + 5, startY + 8, { width: colWidths[0], align: "left" });
      doc.text("Description", startX + colWidths[0] + 5, startY + 8, { width: colWidths[1], align: "left" });
      doc.text("Amount", startX + colWidths[0] + colWidths[1] + 5, startY + 8, { width: colWidths[2], align: "right" });
      doc.text("Paid By", startX - 20 + colWidths[0] + colWidths[1] + colWidths[2] + 5, startY + 8, { width: colWidths[3], align: "right" });

      let rowY = startY + rowHeight;
      doc.fillColor("#000").font("Helvetica").fontSize(10);

      // Add transactions as table rows
      group.expenses.forEach((expense: any, index: number) => {
          const isEvenRow = index % 2 === 0;
          if (isEvenRow) {
              doc.rect(startX, rowY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                 .fill("#f0f0f0");
          }

          doc.fillColor("#000");
          doc.text(`${index + 1}`, startX + 5, rowY + 8, { width: colWidths[0], align: "left" });
          doc.text(expense.description, startX + colWidths[0] + 5, rowY + 8, { width: colWidths[1], align: "left" });
          doc.text(`${expense.amount.toFixed(2)}`, startX + colWidths[0] + colWidths[1] + 5, rowY + 8, { width: colWidths[2], align: "right" });
          doc.text(expense.paidBy.name, startX - 20 + colWidths[0] + colWidths[1] + colWidths[2] + 5, rowY + 8, { width: colWidths[3], align: "right" });

          rowY += rowHeight;

          // Ensure we don't go beyond page limit
          if (rowY + rowHeight > doc.page.height - 50) {
              doc.addPage();
              rowY = 50;
          }
      });

      doc.moveDown(2);

      // Footer
      doc.fillColor("#777").fontSize(10).text(`Generated using Expense Tracker: JUNTRAX`, { align: "center" });

      // Finalize PDF
      doc.end();
  } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Server error" });
  }
};


