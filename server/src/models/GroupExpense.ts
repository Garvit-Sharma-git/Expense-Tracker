import mongoose ,{Schema,Document} from 'mongoose';

interface IGroupExpense extends Document{
    group: mongoose.Types.ObjectId; // The group where the expense is added
    description: string;
    amount: number;
    paidBy: mongoose.Types.ObjectId; // User who paid
    splitAmong: mongoose.Types.ObjectId[]; // Users who share the expense
    date: Date;
}

const GroupExpenseSchema = new Schema<IGroupExpense>(
    {
      group: { type: Schema.Types.ObjectId, ref: "Group", required: true }, // Link to Group
      description: { type: String, required: true },
      amount: { type: Number, required: true },
      paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Who paid
      splitAmong: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], // Users splitting expense
      date: { type: Date, default: Date.now, required: true },
    },
    { timestamps: true }
  );
  
  export default mongoose.model<IGroupExpense>("GroupExpense", GroupExpenseSchema);

