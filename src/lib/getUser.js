import { jwtVerify } from "jose";

// Fail fast at startup — do not let the server run without a signing secret
if (!process.env.JWT_SECRET) {
  throw new Error("Missing environment variable: JWT_SECRET must be set in .env.local");
}

export async function getUserFromRequest(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    let userId = payload.id;
    if (typeof userId === 'object' && userId !== null) {
      console.warn("Detected corrupt old JWT cookie. Forcing re-authentication.");
      return null;
    }

    return userId;
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return null;
  }
}
