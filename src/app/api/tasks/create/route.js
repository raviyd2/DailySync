import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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
    const { title, description, date } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: "Please provide title and date" },
        { status: 400 }
      );
    }

    // Parse YYYY-MM-DD into midnight UTC so getUTCDate() grouping is correct
    const [y, m, d2] = date.split("-").map(Number);
    const storeDate = new Date(Date.UTC(y, m - 1, d2, 0, 0, 0));

    const task = await Task.create({
      userId,
      title,
      description: description || "",
      date: storeDate,
    });

    return NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
