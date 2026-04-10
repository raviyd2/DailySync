import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Routine from "@/models/Routine";
import { getUserFromRequest } from "@/lib/getUser";

export async function GET(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const routines = await Routine.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ routines }, { status: 200 });
  } catch (error) {
    console.error("Get routines error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
