'use server';

import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";

// Reusable serializer — converts Mongoose lean doc to a plain serializable object
const serializeEvent = (e: Record<string, unknown>) => ({
    ...e,
    _id: (e._id as { toString(): string }).toString(),
    createdAt: (e.createdAt as Date)?.toISOString(),
    updatedAt: (e.updatedAt as Date)?.toISOString(),
});

export const getAllEvents = async () => {
    try {
        await connectToDatabase();
        const events = await Event.find().sort({ createdAt: -1 }).lean();
        return events.map(serializeEvent);
    } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
    }
};

export const getEventBySlug = async (slug: string | undefined | null) => {
    if (!slug) return null;
    try {
        await connectToDatabase();
        const event = await Event.findOne({ slug: slug.trim().toLowerCase() }).lean();
        if (!event) return null;
        return serializeEvent(event as Record<string, unknown>);
    } catch (error) {
        console.error("Error fetching event by slug:", error);
        return null;
    }
};

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const eventDoc = await Event.findOne({ slug }).lean();
        if (!eventDoc || !eventDoc.tags?.length) return [];

        const similarEvents = await Event.find({
            _id: { $ne: eventDoc._id },
            tags: { $in: eventDoc.tags },
        }).lean();

        return similarEvents.map(serializeEvent);
    } catch (error) {
        console.error("Error fetching similar events:", error);
        return [];
    }
};