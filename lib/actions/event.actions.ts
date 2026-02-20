'use server';

import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

// Plain serializable event type — no Mongoose Document methods
export type SerializedEvent = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
};

const serializeEvent = (e: Record<string, unknown>): SerializedEvent => ({
    _id: (e._id as { toString(): string }).toString(),
    title: e.title as string,
    slug: e.slug as string,
    description: e.description as string,
    overview: e.overview as string,
    image: e.image as string,
    venue: e.venue as string,
    location: e.location as string,
    date: e.date as string,
    time: e.time as string,
    mode: e.mode as string,
    audience: e.audience as string,
    agenda: e.agenda as string[],
    organizer: e.organizer as string,
    tags: e.tags as string[],
    createdAt: (e.createdAt as Date)?.toISOString(),
    updatedAt: (e.updatedAt as Date)?.toISOString(),
});

export const getAllEvents = async (): Promise<SerializedEvent[]> => {
    'use cache';
    cacheTag('events');
    cacheLife('hours');

    try {
        await connectToDatabase();
        const events = await Event.find().sort({ createdAt: -1 }).lean();
        return events.map(serializeEvent);
    } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
    }
};

export const getEventBySlug = async (slug: string | undefined | null): Promise<SerializedEvent | null> => {
    'use cache';
    cacheTag('events', `event-${slug}`);
    cacheLife('hours');

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

export const getSimilarEventsBySlug = async (slug: string): Promise<SerializedEvent[]> => {
    'use cache';
    cacheTag('events');
    cacheLife('hours');

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

export const invalidateEventCache = async (slug?: string) => {
    if (slug) {
        revalidateTag(`event-${slug}`, 'everything');
    }
    revalidateTag('events', 'everything');
};