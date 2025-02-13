import { time } from "console";
import mongoose,{Schema,Document} from "mongoose";

interface IGroup extends Document{
    name:string;
    admin:mongoose.Types.ObjectId;
    members:mongoose.Types.ObjectId[];
    expenses:mongoose.Types.ObjectId[];
    createdAt:Date;
    balances: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User ID
          amount: { type: Number, default: 0 }, // How much they owe (negative means they are owed money)
        }
      ];
      
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
},{timestamps:true});

export default mongoose.model<IGroup>("Group",GroupSchema);