import { Suspense } from "react";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ---------------------------------------------------------------------------
// Helper: safely normalise agenda/tags coming from the DB.
// Old documents may have been saved as [ '["item1","item2"]' ] due to a bug
// where formData fields were double-serialised before being stored.
// New documents will arrive as a proper string[].
// ---------------------------------------------------------------------------
const parseArrayField = (field: unknown): string[] => {
  if (Array.isArray(field)) {
    // Malformed case: array wrapping a single JSON string → parse the inner string
    if (field.length === 1 && typeof field[0] === 'string') {
      try {
        const parsed = JSON.parse(field[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Not valid JSON – treat the element as the only item
      }
    }
    return field as string[];
  }
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [field];
    }
  }
  return [];
};

// ---------------------------------------------------------------------------
// Presentational sub-components
// ---------------------------------------------------------------------------
const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={16} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <span key={tag} className="pill">
        {tag}
      </span>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Data-fetching component (must live inside <Suspense> to avoid blocking)
// ---------------------------------------------------------------------------
const EventDetailsContent = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
    cache: "no-store",
  });

  if (!request.ok) return notFound();

  const data = await request.json();

  if (!data.event) return notFound();

  const {
    _id,
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags,
    organizer,
  } = data.event;

  if (!description) return notFound();

  const agendaItems = parseArrayField(agenda);
  const tagItems = parseArrayField(tags);

  const bookings = 10;

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left side – Event Content */}
        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg"    alt="time"     label={time} />
            <EventDetailItem icon="/icons/pin.svg"      alt="location" label={location} />
            <EventDetailItem icon="/icons/mode.svg"     alt="mode"     label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={agendaItems} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tagItems} />
        </div>

        {/* Right side – Booking */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Joining {bookings} people who already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}
            <BookEvent eventId={_id} slug={slug} />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent: IEvent) => (
              <EventCard key={similarEvent.title} {...similarEvent} />
            ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Page – wraps content in Suspense so the fetch doesn't block rendering
// ---------------------------------------------------------------------------
const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => (
  <Suspense fallback={<div>Loading event...</div>}>
    <EventDetailsContent params={params} />
  </Suspense>
);

export default EventDetailsPage;