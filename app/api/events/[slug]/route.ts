import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';

// Route segment config for dynamic rendering
export const dynamic = "force-dynamic";

// Type for route params
interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Standardized API response type
interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();

    let event;

    try { 
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 })
    }

    const file = formData.get('image') as File;

    if (!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 });

    const tags = JSON.parse(formData.get('tags') as string);
    const agenda = JSON.parse(formData.get('agenda') as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) return reject(error);

        resolve(result);

    }).end(buffer);
  });

  event.image = (uploadResult as { secure_url: string }).secure_url;

  const createdEvent = await Event.create({...event, 
    tags: tags,
    agenda: agenda,
  });

  return NextResponse.json({ success: true, event: createdEvent }, { status: 201 });

  } 
  catch (e) {
    console.error("Error handling POST request:", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
  

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<IEvent>>> {
  try {
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric with hyphens only)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { success: false, error: "Invalid slug format" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query event by slug
    const event = await Event.findOne({ slug }).lean<IEvent>();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true,  event }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
