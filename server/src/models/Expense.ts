import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        // id:{ type: String, required: true },
        type:{ type: String ,required: true },
        category:{ type: String, required: true},
        amount:{ type: Number, required: true},
        date:{ type: Date, required: true},
        description:{ type: String, required:false },
        userId: { type:mongoose.Schema.Types.ObjectId, ref:'User',required:true}

    }
);

const Expense = mongoose.model('Expense',expenseSchema);

export default Expense;