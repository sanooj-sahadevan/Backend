import jwt from "jsonwebtoken";

export function generateAccessToken(id: string, role: string): string {
  try {
    const payload = { id, role };
    const options = { expiresIn: "1h" }; 
    return jwt.sign(payload, ({ userId: user._id }, process.env.JWT_SECRET!, }), options);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export function generateRefreshToken(id: string, role: string): string {
  try {
    const payload = { id, role };
    const options = { expiresIn: "7d" }; 
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        
      }options);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
