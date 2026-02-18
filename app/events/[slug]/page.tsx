import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label}: { icon: string; alt: string; label: string}) => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Image src={icon} alt={alt} width={16} height={17} />
      <p>{label}</p>
    </div>
  )
}

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item, index) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="pill">
          {tag}
        </span>
      ))}
    </div>
    
    )
  }

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const request = await fetch(
  `${BASE_URL}/api/events/${slug}`,
  { cache: "no-store" }
);

  if (!request.ok) return notFound();
  const data = await request.json();
  
  if (!data.event) return notFound();
  
  const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = data.event;

  if (!description) return notFound();

    const bookings = 10;

    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

    console.log(similarEvents)

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>
      <div className="details">
      {/* Left side - Event Content */}
      <div className="content">
        <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

        <section className="flex-col-gap-2">
          <h2>Overview</h2>
          <p>{overview}</p>
        </section>

        <section className="flex-col-gap-2">
          <h2>Event Details</h2>
          <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
          <EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />
          <EventDetailItem icon="/icons/pin.svg" alt="location" label={location} />
          <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
          <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />

        </section>

        <EventAgenda agendaItems={JSON.parse(agenda)} />

        <section className="flex-col-gap-2">

        <h2>About the Organizer</h2>
          <p>{organizer}</p>
        </section>
        
        <EventTags tags={JSON.parse(tags)} />
      </div>

      {/* Right side - Event Image */}

      <aside className="booking">
        <div className="signup-card">
          <h2>Book Your Spot</h2>
          { bookings > 0 ? (
            <p className="text-sm">
              Joining { bookings } people who already booked their spot!
            </p>
          ) : (
            <p className="text-sm">Be the first to book your spot!</p>
          )
        }
        <BookEvent />
        </div>
      </aside>

      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length >  0 && similarEvents.map((similarEvent: IEvent) => (
            <EventCard key={similarEvent.title} {...similarEvent} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default EventDetailsPage