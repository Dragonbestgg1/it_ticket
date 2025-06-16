import { NextRequest, NextResponse } from "next/server";
import getMongoClientPromise from "../../lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClientPromise();
    const db = client.db("it_ticket");
    const collection = db.collection("tickets");

    // Get total number of tickets
    const totalTickets = await collection.countDocuments();

    // Get number of tickets that are NOT closed
    const openTickets = await collection.countDocuments({ status: { $ne: "closed" } });

    return NextResponse.json({
      totalTickets,
      openTickets,
    });
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}