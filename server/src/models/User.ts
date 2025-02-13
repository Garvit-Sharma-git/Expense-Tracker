import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  friends: mongoose.Types.ObjectId[]; 
  friendRequests: mongoose.Types.ObjectId[]; 
  groupIds: mongoose.Schema.Types.ObjectId[];
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
  
},{timestamps:true});


export default mongoose.model<IUser>('User', UserSchema);
