import  Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { IEvent } from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    const arrayFields = ['agenda', 'tags'];

    const event: Record<string, unknown> = Object.fromEntries(
      [...formData.keys()]
        .filter((key, i, arr) => arr.indexOf(key) === i)
        .map((key) => [
          key,
          arrayFields.includes(key) ? formData.getAll(key) : formData.get(key),
        ])
    );

    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'DevEvents' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as { secure_url: string });
        }
      ).end(buffer);
    });

    event.image = uploadResult.secure_url;

    const createdEvent = await Event.create(event);

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET() {
    try {
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched succesfully', events }, { status: 200 });
        
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}