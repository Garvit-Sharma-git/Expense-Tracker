import { Request, Response } from "express";
import Expense from "../models/Expense";

interface custom extends Request {
    user?: {
      id: string;
      name: string;
      email: string;
      friends: string[];
      friendRequests: string[];
      groupIds:string[];
    };
  }

export const createExpense =async ( req: custom, res: Response )=>{
    const { type,category,amount,date,description } = req.body;
    const userId = req.user?.id;
    try {
        
        const newExpense = new Expense({ type,category,amount,date,description,userId });
        await newExpense.save();

        res.status(201).json({ message:'Expense saved successfully', data: newExpense })
    } catch (error) {
        res.status(500).json({ error:'server error', details: error });
    }
}

export const getExpense = async ( req:custom,res:Response ) => {
    try {
        const userId = req.user?.id;
        const expenses= await Expense.find({userId});
        res.status(201).json(expenses)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expenses', details: error })
    }
}

export const deleteExpense = async (req: Request, res: Response):Promise<any> => {
    const { id } = req.params;

    try {
        const deletedExpense = await Expense.findByIdAndDelete(id);
        if (!deletedExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully', deletedExpense });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error});
    }
};

export const updateExpense = async (req:Request,res:Response):Promise<any> => {
    const {id} = req.params;
    try {
        
        const updatedExpense = await Expense.findOneAndUpdate({ _id: id }, req.body, { new: true });
        if(!updatedExpense){
            return res.status(404).json({error:'Expense not found'})
        }
        res.status(200).json({message:'Expense updated successfully', updatedExpense})
        
    } catch (error) {
        // console.error(error);
        res.status(500).json({error:'error updating data', details:error})
    }
}