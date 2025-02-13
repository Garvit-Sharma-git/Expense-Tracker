import { Request, Response } from 'express';
import User from '../models/User';
import {IUser} from '../models/User';

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

export const sendFriendRequest = async (req: custom  , res: Response):Promise<void> => {
    const { friendId  } = req.body;
    

    try {
        if (!req.user) {
            res.status(401).json({ msg: 'Unauthorized: user not found' });
            return;
        }

        const user = await User.findById(req.user.id);
        const friend = await User.findById(friendId);

        if (!friend) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }

        if (user?.friendRequests.includes(friendId)) {
            res.status(400).json({ msg: 'Friend request already sent' });
            return; 
        }

        user?.friendRequests.push(friendId);
        await user?.save();

        // Send the response but do not return the Response object
        res.status(200).json({ msg: 'Friend request sent' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};


// export const acceptFriendRequest = async (req: Request, res: Response) => {
//     const { friendId } = req.body;
//     try {
//         const user = await User.findById(req.user.id);
//         const friend = await User.findById(friendId);

//         if (!friend) return res.status(404).json({ msg: 'User not found' });
//         if (!user?.friendRequests.includes(friendId)) {
//             return res.status(400).json({ msg: 'No friend request to accept' });
//         }

//         user?.friends.push(friendId);
//         friend?.friends.push(user.id);

//         // Remove from friend requests
//         user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
//         await user?.save();
//         await friend?.save();

//         res.status(200).json({ msg: 'Friend request accepted' });
//     } catch (err) {
//         res.status(500).json({ msg: 'Server error' });
//     }
// };
