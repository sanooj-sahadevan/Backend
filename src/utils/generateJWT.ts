import jwt from "jsonwebtoken";

// Generate Access Token
export function generateAccessToken(id: string, role: string): string {
  const payload = { id, role };
  const options = { expiresIn: "1h" }; // Access token valid for 1 hour
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
}

// Generate Refresh Token
export function generateRefreshToken(id: string, role: string): string {
  const payload = { id, role };
  const options = { expiresIn: "7d" }; // Refresh token valid for 7 days
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
}
