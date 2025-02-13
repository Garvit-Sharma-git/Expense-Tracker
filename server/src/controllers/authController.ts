import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import router from '../routes/auth';

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

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    console.log(req.body);
    

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);
        const newUser = new User({ name, email, password: hashedPassword });
        // console.log(newUser);
        
        
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    // console.log(req.body);

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        // console.log('JWT_SECRET:', process.env.JWT_SECRET);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' }); 
    }
};

export const getUser = async (req: custom, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select("-password"); 
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
};

export const verifyToken = async (req: custom, res: Response):Promise<void> => {
    const authHeader = req.headers['authorization'];

    if(!authHeader || !authHeader.startsWith('Bearer')){
        res.status(401).json({error:"Invalid Token"})
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded  = jwt.verify(token,process.env.JWT_SECRET as string) as {id:string};
        const user = await User.findById(decoded.id)

        if(!user){
            res.status(404).json({error:"user not found"});

        }

        res.status(200).json({message:"token is valid yoo!!", user:{ id:user?._id , name:user?.name, email: user?.email }})
    } catch (error) {
        res.status(401).json({error:"Unauthorized : invalid token"})
    }
}