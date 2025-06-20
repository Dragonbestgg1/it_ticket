import { NextRequest, NextResponse } from "next/server";
import getMongoClientPromise from "../../lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClientPromise();
    const db = client.db("it_ticket");
    const collection = db.collection("tickets");

    // Fetch all tickets
    const tickets = await collection.find({}).toArray();

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}