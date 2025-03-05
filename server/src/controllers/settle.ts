import { Request, Response } from "express";
import mongoose from "mongoose";
import Group from "../models/group";
import User from "../models/User";

import GroupExpense from "../models/GroupExpense";

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

export const addExpenseToGroup = async (
  req: custom,
  res: Response
): Promise<any> => {
  try {
    const { groupId, description, amount, paidBy, splitAmong, splitDetails } =
      req.body;
    const Amount = Number(amount);
    console.log({
      groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splitDetails,
    });

    // console.log("split details",splitDetails )
    // console.log("Received request:", req.body);

    const group = await Group.findById(groupId);
    // console.log("add ka group",group);

    if (!group) {
      return res.status(404).json({ message: "Group not found" }); 
    }

    if (
      !group.members.includes(
        req.user?.id as unknown as mongoose.Types.ObjectId
      )
    ) {
      return res
        .status(401)
        .json({ message: "You are not a member of this group" });
    }

    if (!Array.isArray(splitDetails)) {
      return res.status(400).json({ message: "invalid split details format" });
    }
    // const totalSplitAmount = splitDetails.reduce(
    //   (sum: number, detail: { amount: number }) => sum + detail.amount,
    //   0
    // );
    // // console.log("total split and amount:", totalSplitAmount, Amount);
    // if (totalSplitAmount !== Amount) {
    //   return res
    //     .status(400)
    //     .json({ message: "Total split amounts do not match expense amount" });
    // }

    const expense = new GroupExpense({
      group: groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splitDetails,
    });
    await expense.save();
    // console.log(expense)

    console.log("Group BEFORE Adding Expense:", {
      balances: group.balances,
      settlements: group.settlements,
      expenses: group.expenses,
    });

    group.expenses.push(expense._id as mongoose.Types.ObjectId);
    // console.log("Group updated:", group);

    group.settlements = [];

    await group.save();

    console.log("Group AFTER Adding Expense:", {
      balances: group.balances,
      settlements: group.settlements,
      expenses: group.expenses,
    });

    await recalculateBalances(groupId);

    res
      .status(201)
      .json({ message: "Expense added to the group successfully", expense });
  } catch (error) {
    console.error("Error adding expense:", error);
    res
      .status(500)
      .json({ error: "Error Adding Expense to Group", details: error });
  }
};

const recalculateBalances = async (groupId: string) => {
  console.log("RECALCULATE BALANCES  hai ye");

  const group = await Group.findById(groupId).populate({
    path: "expenses",
    populate: [
      {
        path: "paidBy",
        select: "_id name",
      },
      {
        path: "splitDetails.user",
        select: "_id name",
      },
    ],
  });

  if (!group) throw new Error("Group not found");

  const totalPaid: Record<string, number> = {};
  const totalShare: Record<string, number> = {};
  const settledAmounts: Record<string, number> = {}; // Track settled amounts

  // Initialize balances
  group.members.forEach((member) => {
    totalPaid[member.toString()] = 0;
    totalShare[member.toString()] = 0;
    settledAmounts[member.toString()] = 0; // Initialize settled amounts
  });

  for (const expense of group.expenses as any[]) {
    const paidById = (
      expense.paidBy as { _id: mongoose.Types.ObjectId }
    )._id.toString();

    // console.log("total paid by id", totalPaid[paidById]);
    // console.log("expense amount", expense.amount); 

    totalPaid[paidById] += expense.amount;
    

    // console.log("total paid by id after formula", totalPaid[paidById]);

    for (const detail of expense.splitDetails) {
      const userId = (
        detail.user as { _id: mongoose.Types.ObjectId }
      )._id.toString();
      // console.log("total share by id", totalShare[userId]);
      // console.log("detail amount", detail.amount);

      totalShare[userId] += detail.amount;
      

      // console.log("total share by id after formula", totalShare[userId]);
    }
  }
  // console.log("group settlemets hai ye", group.settlements);     
  console.log("Total Paid (Recalculated):", totalPaid);
  console.log("Total Share (Recalculated):", totalShare);
  

  if (group.settlements) {
    for (const settlement of group.settlements) {
      const fromId = settlement.from.toString();
      const toId = settlement.to.toString();
      
      // Track settlements as adjustments to balances
      settledAmounts[fromId] = (settledAmounts[fromId] || 0) + settlement.amount;
      settledAmounts[toId] = (settledAmounts[toId] || 0) - settlement.amount;

    }
  }

  console.log("Total Paid:", totalPaid);
  console.log("Total Share:", totalShare);
  console.log("Settled Amounts:", settledAmounts)

  const netBalances: Record<string, number> = {};
Object.keys(totalPaid).forEach((userId) => {
  netBalances[userId] = Number(
    ((totalPaid[userId] - totalShare[userId]) + (settledAmounts[userId] || 0)).toFixed(2)
  );
}); 
console.log("Net Balances Before Rounding:", netBalances);

  // console.log("net balances hai ye: ", netBalances);

  group.balances = Object.keys(netBalances).map((userId) => ({
    user: new mongoose.Types.ObjectId(userId) as any,
    amount: netBalances[userId],
  }));

  // console.log("group  ", group);
  console.log("Group BEFORE Saving Balances:", {
    balances: group.balances,
    settlements: group.settlements,
  });


  await group.save();
  console.log("Group AFTER Saving Balances:", {
    balances: group.balances,
    settlements: group.settlements,
  });
};

interface Balance {
  user: mongoose.Types.ObjectId;
  amount: number;
  name: string;
}

interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export const settleUpWork = async ( 
  req: custom,
  res: Response
): Promise<any> => {
  try {
    console.log("SETTLEUP WORK hai ye");
    const { groupId } = req.body;
    // console.log("Received groupId:", groupId);

    const group = await Group.findById(groupId).populate({
      path: "balances.user",
      select: "name",
      model: "User",
    });
    // console.log("Fetched Group:", group);

    // console.log("group hanji settleup work me hu me ",group?.name);
    // console.log("user ki info :",req.user)

    if (!group) return res.status(404).json({ message: "Group not found" });

    type populatedBalance = {
      user: {
        _id: mongoose.Types.ObjectId;
        name: string;
      };
      amount: number;
    };

    const balances: populatedBalance[] = group.balances as unknown as populatedBalance[];
    // console.log("Group Balances:", group.balances);

    if (group.balances.every(b => b.amount === 0)) {
      return res.json({ message: "All balances are already settled" });
    }

    const formattedBalances = balances.map((b) => ({
      user: new mongoose.Types.ObjectId(b.user._id.toString()),
      name: b.user.name,
      amount: b.amount,
    }));

    // console.log("Formatted Balances for Settlement:", formattedBalances);

    console.log("Balances BEFORE Settlement:", group.balances);


    const settlements = minimizeTransactions(formattedBalances);

    console.log("Generated Settlements:", settlements);

    // console.log("user ki info :",req.user?.name)

    group.settlements = settlements.map((s) => ({
      from: new mongoose.Types.ObjectId(s.from),
      to: new mongoose.Types.ObjectId(s.to),
      amount: s.amount,
    }));

    console.log("Group BEFORE Saving Settlements:", {
      balances: group.balances,
      settlements: group.settlements,
    });


    await group.save();

    console.log("Group AFTER Saving Settlements:", {
      balances: group.balances,
      settlements: group.settlements,
    });


    res.json({ settlements });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const minimizeTransactions = (balances: Balance[]): Settlement[] => {
  console.log("MINIMIZE TRANSACTIONS  hai ye");
  const creditors: Balance[] = [];
  const debtors: Balance[] = [];

  console.log("Creditors:", creditors);
  console.log("Debtors:", debtors);

  for (const { user, name, amount } of balances) {
    if (amount > 0) creditors.push({ user, name, amount });
    else if (amount < 0) debtors.push({ user, name, amount: -amount });
  }

  const settlements: Settlement[] = [];

  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];

    const settledAmount = Math.min(creditor.amount, debtor.amount);

    // console.log("ye dkhoooo", debtor.user);

    settlements.push({
      from: debtor.user.toString(),
      fromName: debtor.name,
      to: creditor.user.toString(),
      toName: creditor.name,
      amount: settledAmount,
    });

    creditor.amount -= settledAmount;
    debtor.amount -= settledAmount;

    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }
  // console.log("Generated Settlements:", settlements);

  return settlements;
};

export const confirmSettlement = async (
  req: custom,
  res: Response
): Promise<any> => {
  try {
    console.log("CONFIRM SETTLEMENTS hai ye");
    // console.log("Received settlement request:", req.body);

    let { groupId, fromUserId, toUserId, amount } = req.body;

    if (!groupId || !fromUserId || !toUserId || amount <= 0) {
      return res.status(400).json({ message: "Invalid settlement request" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const fromUserIdStr = fromUserId.toString();
    const toUserIdStr = toUserId.toString();

    let fromBalance = group.balances.find(
      (b) => b.user.toString() === fromUserIdStr
    );
    let toBalance = group.balances.find(
      (b) => b.user.toString() === toUserIdStr
    );

    if (!fromBalance || !toBalance) {
      return res.status(400).json({ message: "User balances not found" });
    }

    // console.log(
    //   `Before Settlement -> From: ${fromBalance.amount}, To: ${toBalance.amount}`
    // );
    // console.log(`Settlement Request Amount: ${amount}`);
    console.log("Balances BEFORE Settlement:", {
      fromUser: { id: fromUserIdStr, balance: fromBalance.amount },
      toUser: { id: toUserIdStr, balance: toBalance.amount },
      amountToSettle: amount,
    });

    if (fromBalance.amount === 0 && toBalance.amount === 0) {
      amount = 0;
    }

    // **Fix: Convert everything to numbers to avoid type issues**
    amount = Number(amount);
    fromBalance.amount = Number(fromBalance.amount);
    toBalance.amount = Number(toBalance.amount);

    // console.log(
    //   `Converted Values -> From: ${fromBalance.amount}, To: ${toBalance.amount}, Amount: ${amount}`
    // );

    // **Fix: Prevent floating-point precision errors by rounding**
    const fromBalanceRounded = Math.round(fromBalance.amount * 100) / 100;
    const toBalanceRounded = Math.round(toBalance.amount * 100) / 100;
    const amountRounded = Math.round(amount * 100) / 100;

    // console.log(
    //   `Rounded Values -> From: ${fromBalanceRounded}, To: ${toBalanceRounded}, Amount: ${amountRounded}`
    // );

    // **Fix: Ensure settlement amount does not exceed owed balance**
    // if (Math.abs(fromBalanceRounded) < amountRounded) {
    //   return res.status(400).json({ message: "Amount exceeds due balance",details: {from: fromBalanceRounded, amount: amountRounded} });
    // }

    // Deduct the settled amount
    if (fromBalance.amount < 0) {
      fromBalance.amount += amount; // Reduce the debt
    } else {
      fromBalance.amount -= amount; // Reduce the credit if any
    }

    // If toUser was supposed to receive, reduce their credit
    if (toBalance.amount > 0) {
      toBalance.amount -= amount; // Reduce the credit
    } else {
      toBalance.amount += amount; // Reduce the debt if any
    }

    // console.log(
    //   `After Settlement -> From: ${fromBalance.amount}, To: ${toBalance.amount}`
    // );
    // console.log("amount 1", amount);

    if (fromBalance.amount === 0 && toBalance.amount === 0) {
      amount = 0;
    }
    // console.log("amount 2", amount);

    // **Ensure balances correctly reach 0 when fully settled**
    if (Math.abs(fromBalance.amount) < 0.01) fromBalance.amount = 0;
    if (Math.abs(toBalance.amount) < 0.01) toBalance.amount = 0;

    // console.log("Updated Group Balances:", group.balances);


    console.log("Balances AFTER Settlement:", {
      fromUser: { id: fromUserIdStr, balance: fromBalance.amount },
      toUser: { id: toUserIdStr, balance: toBalance.amount },
    });

    // **Fix: Remove old settlements for the same users**
    group.settlements = group.settlements.filter(
      (s) =>
        !(
          s.from.toString() === fromUserIdStr && s.to.toString() === toUserIdStr
        )
    );

    // **Fix: If all balances are zero, clear all settlements**
    if (group.balances.every((b) => b.amount === 0)) {
      group.settlements = [];
      // console.log("All balances settled, clearing past settlements.");
    }
console.log("Group BEFORE Saving:", {
      balances: group.balances,
      settlements: group.settlements,
    });
    await group.save();
    console.log("Group AFTER Saving:", {
      balances: group.balances,
      settlements: group.settlements,
    });

    res.json({
      message: "Settlement confirmed",
      updatedBalances: group.balances,
    });
  } catch (error) {
    console.error("Error processing settlement:", error);
    res.status(500).json({ message: "Server error" });
  }
};
 