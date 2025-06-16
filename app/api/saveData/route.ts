import { NextRequest, NextResponse } from "next/server";
import getMongoClientPromise from "../../lib/mongo";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "tickets.csv"); 
    const csvData = fs.readFileSync(filePath, "utf-8");

    const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

    const formattedData = parsedData.map((item: any) => ({
      id: Number(item.id),
      client_name: item.client_name,
      title: item.title,
      status: item.status,
      priority: item.priority,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
    }));

    const client = await getMongoClientPromise();
    const db = client.db("it_ticket");
    const collection = db.collection("tickets");

    const result = await collection.insertMany(formattedData);

    return NextResponse.json({ message: "Data inserted successfully", insertedCount: result.insertedCount });
  } catch (error) {
    console.error("Error processing CSV:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}