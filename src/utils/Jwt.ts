
import { encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;
export async function signAppToken(payload: Record<string, unknown>): Promise<string> {
  // const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 7;
  return encode({
    secret,
    token: { ...payload } as JWT
  });
}
