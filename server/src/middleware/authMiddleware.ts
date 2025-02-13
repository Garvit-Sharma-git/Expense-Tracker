import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

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

interface UserPayload {
  id: string;
}

const authMiddleware = async (
  req: custom,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).json({ message: "No token, authorization denied" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded: UserPayload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;
    // console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded.id);
    // console.log("User from database:", user);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    // console.log('User:',user);

    req.user = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      friends: user.friends.map((friend) => friend.toString()),
      friendRequests: user.friendRequests.map((request) => request.toString()),
      groupIds: user.groupIds.map((group) => group.toString()),
    };
    // console.log('req.user:', req.user);
    // return res.status(200).json({ message: 'Token is valid', user: { id: user.id, name: user.name, email: user.email } });
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
