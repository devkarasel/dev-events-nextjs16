'use server';

import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    // Make 'event' a plain object
    const eventDoc = await Event.findOne({ slug }).lean();
    if (!eventDoc || !eventDoc.tags?.length) return [];

    // Find similar events as plain objects
    const similarEvents = await Event.find({
      _id: { $ne: eventDoc._id },
      tags: { $in: eventDoc.tags }
    }).lean();

    // Convert _id and dates to strings for serialization
    const serializedEvents = similarEvents.map(e => ({
      ...e,
      _id: e._id.toString(),
      createdAt: e.createdAt?.toISOString(),
      updatedAt: e.updatedAt?.toISOString()
    }));

    return serializedEvents;
  } catch (error) {
    console.error("Error fetching similar events:", error);
    return [];
  }
};
