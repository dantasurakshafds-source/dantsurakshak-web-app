
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../authOptions";


export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json(
            { error: "Not authenticated",status: 401 }
        );
    }
    return NextResponse.json({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        //@ts-expect-error ignore this 
        phoneNumber: session.phoneNumber.email,
        //@ts-expect-error ignore this 
        role: session.role.email,
        //@ts-expect-error ignore this 
        status: session.role.email,
        //@ts-expect-error ignore this 
        isVerified: session.isVerified.email,
    });
}
