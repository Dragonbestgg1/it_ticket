import { NextRequest, NextResponse } from "next/server";
import getMongoClientPromise from "../../lib/mongo";

export async function POST(req: NextRequest) {
  try {
    const client = await getMongoClientPromise();
    const db = client.db("it_ticket");
    const collection = db.collection("tickets");

    const body = await req.json();
    const { client_name, title, priority } = body;

    // Validate required fields
    if (!client_name || !title || !priority) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const count = await collection.countDocuments({});
    const customId = count + 1;

    // Create new ticket object
    const newTicket = {
      id: customId,
      client_name,
      title,
      status: "open",
      priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await collection.insertOne(newTicket);

    return NextResponse.json({ 
      message: "Ticket created successfully", 
      ticket: { _id: result.insertedId, ...newTicket } 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}