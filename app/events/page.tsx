import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import EventCard from "@/components/EventCard";
import { getAllEvents } from "@/lib/actions/event.actions";

const EventsList = async () => {
    'use cache';
    cacheTag('events');
    cacheLife('hours');

    const events = await getAllEvents();

    if (events.length === 0) {
        return <p className="text-muted">No events found. Check back soon!</p>;
    }

    return (
        <ul className="events">
            {events.map((event) => (
                <li key={event.title} className="list-none">
                    <EventCard {...event} />
                </li>
            ))}
        </ul>
    );
};

const EventsPage = () => {
    return (
        <section>
            <div className="header">
                <h1>All Events</h1>
                <p>Browse all upcoming hackathons, meetups, and conferences</p>
            </div>

            <div id="events-list">
                <Suspense fallback={<p>Loading events...</p>}>
                    <EventsList />
                </Suspense>
            </div>
        </section>
    );
};

export default EventsPage;