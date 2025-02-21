import mongoose from 'mongoose';

const SettlementSchema = new mongoose.Schema(
    {
        payer: { type: mongoose.Schema.Types.ObjectId, ref:"User" , required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref:"User" , required: true },
        amount: {type : Number, required: true},
        groupId:{ type: mongoose.Schema.Types.ObjectId , ref:'Group', required:true},
        date : { type: Date, required:true}
    }
);

export const Settlement = mongoose.model('Settlement',SettlementSchema);