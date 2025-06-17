import { NextRequest, NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongo";

export async function PUT(req: NextRequest, contextPromise: Promise<{ params: { id: string } }>) {
  try {
    const { params } = await contextPromise;
    const id = Number(params.id);

    const client = await getMongoClientPromise();
    const db = client.db("it_ticket");
    const collection = db.collection("tickets");

    const body = await req.json();
    const { client_name, title, status, priority } = body;

    if (!id || !client_name || !title || !priority || !status) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingTicket = await collection.findOne({ id });
    if (!existingTicket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    await collection.updateOne(
      { id },
      {
        $set: {
          client_name,
          title,
          status,
          priority,
          updated_at: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ message: "Ticket updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}
