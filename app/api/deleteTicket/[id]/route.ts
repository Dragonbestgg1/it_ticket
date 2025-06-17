import { NextRequest, NextResponse } from "next/server";
import getMongoClientPromise from "../../../lib/mongo";
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const id = Number(params.id);

    const client = await getMongoClientPromise();
    const db = client.db("it_ticket");
    const collection = db.collection("tickets");

    const existingTicket = await collection.findOne({ id });
    if (!existingTicket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    await collection.deleteOne({ id });

    return NextResponse.json({ message: "Ticket deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}