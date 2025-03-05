import { time } from "console";
import mongoose,{Schema,Document} from "mongoose";

interface ISettlement {
    from: mongoose.Types.ObjectId;
    to: mongoose.Types.ObjectId;
    amount: number;
    // isSettled: Boolean,
  }

interface IGroup extends Document{
    name:string;
    admin:mongoose.Types.ObjectId;
    members:mongoose.Types.ObjectId[];
    expenses:mongoose.Types.ObjectId[];
    createdAt:Date;
    balances: {
          user:  mongoose.Schema.Types.ObjectId; // User ID
          amount: number; // How much they owe (negative means they are owed money)
        }[];
    settlements: ISettlement[];
    
      
}

const GroupSchema=new Schema<IGroup>({
    name:{
        type:String,
        required:true,
        // unique:true
    },
    admin:{ 
        type:Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    members:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    expenses:[{
        type:Schema.Types.ObjectId,
        ref:'GroupExpense'
    }],
    balances: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User ID
          amount: { type: Number, default: 0 }, // How much they owe (negative means they are owed money)
        }
      ],
      settlements: [
        {
          from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          amount: Number,
          // isSettled: Boolean
        },
      ],
},{timestamps:true});
 
export default mongoose.model<IGroup>("Group",GroupSchema);