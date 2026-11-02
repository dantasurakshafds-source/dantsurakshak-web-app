import { NextRequest, NextResponse } from "next/server";

const cookieNames = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
];

function createLogoutResponse(req: NextRequest) {
  const url = new URL("/auth/login", req.url);
  const response = NextResponse.json(
    { success: true, url: url.toString() },
    { status: 200 }
  );

  for (const name of cookieNames) {
    // Clear regular cookie
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    // Clear secure variant
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  }

  return response;
}

export async function POST(req: NextRequest) {
  return createLogoutResponse(req);
}

export async function GET(req: NextRequest) {
  return createLogoutResponse(req);
}
