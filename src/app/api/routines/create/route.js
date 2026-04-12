import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Routine from "@/models/Routine";
import Task from "@/models/Task";
import { getUserFromRequest } from "@/lib/getUser";

export async function POST(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { title, description, frequency, startDate, endDate, targetDuration } = body;

    if (!title || !frequency) {
      return NextResponse.json(
        { error: "Please provide title and frequency" },
        { status: 400 }
      );
    }

    if (!["daily", "weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency" },
        { status: 400 }
      );
    }

    // Parse YYYY-MM-DD strings as explicit UTC midnight to avoid timezone drift.
    // Default startDate = IST today at midnight UTC (add 5h30m offset then round to date).
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(Date.now() + IST_OFFSET_MS);
    const defaultStart = new Date(Date.UTC(
      nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()
    ));

    const parseDateStr = (str) => {
      const [y, m, d] = str.split("-").map(Number);
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    };

    const routine = await Routine.create({
      userId,
      title,
      description: description || "",
      frequency,
      startDate: startDate ? parseDateStr(startDate) : defaultStart,
      endDate:   endDate   ? parseDateStr(endDate)   : null,
      targetDuration: Number(targetDuration) || 60,
    });

    return NextResponse.json(
      { message: "Routine created successfully", routine },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create routine error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
