import { Suspense } from "react";
import  { cacheLife } from "next/cache";
import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ---------------------------------------------------------------------------
// Data-fetching component — inside Suspense so it doesn't block page render
// ---------------------------------------------------------------------------
const FeaturedEvents = async () => {
  "use cache";
  cacheLife("hours"); // Revalidate every hour — adjust to "minutes" or "days" as needed

  let events: IEvent[] = [];

  try {
    const response = await fetch(`${BASE_URL}/api/events`);
    if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
    const data = await response.json();
    events = data.events ?? [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error loading featured events:", error);
    }
    // Render an empty state instead of crashing the page
  }

  if (events.length === 0) {
    return <p className="text-muted">No events found. Check back soon!</p>;
  }

  return (
    <ul className="events">
      {events.map((event: IEvent) => (
        <li key={event.title} className="list-none">
          <EventCard {...event} />
        </li>
      ))}
    </ul>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const Page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-5">
        <h3>Featured Events</h3>
        <Suspense fallback={<p>Loading events...</p>}>
          <FeaturedEvents />
        </Suspense>
      </div>
    </section>
  );
};

export default Page;