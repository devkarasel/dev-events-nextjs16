import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About DevEvent — The Hub for Developer Events",
    description:
        "DevEvent is a curated platform bringing together the best developer events — conferences, hackathons, and meetups — covering React, AI, Web3, DevOps, and more.",
    openGraph: {
        title: "About DevEvent — The Hub for Developer Events",
        description:
            "Discover how DevEvent helps developers stay connected with the events that matter most — from AI summits to Web3 hackathons.",
        type: "website",
    },
};

const topics = [
    "React & Next.js",
    "JavaScript",
    "AI & Machine Learning",
    "Web3 & Blockchain",
    "Full Stack",
    "DevOps & Cloud",
    "Mobile Development",
    "Cybersecurity",
    "Data Science",
    "Frontend",
];

const eventTypes = [
    {
        icon: "🎤",
        title: "Conferences",
        description:
            "Multi-day events with keynotes, workshops, and networking from the biggest names in the industry.",
    },
    {
        icon: "⚡",
        title: "Hackathons",
        description:
            "Build something in 24–48 hours. Compete, collaborate, and ship real products with developers worldwide.",
    },
    {
        icon: "🤝",
        title: "Meetups",
        description:
            "Casual, community-driven gatherings. Great for networking, learning, and finding your local dev scene.",
    },
];

const AboutPage = () => {
    return (
        <section id="about">

            {/* Hero Header */}
            <div className="header">
                <h1>About DevEvent</h1>
                <p>The hub for every developer event you can&apos;t miss</p>
            </div>

            {/* What is DevEvent */}
            <article className="flex-col-gap-2">
                <h2><strong>What is DevEvent?</strong></h2>
                <p>
                    DevEvent is a <strong>curated platform</strong> that brings together the best developer
                    events in one place. From React and Next.js conferences to AI hackathons, Web3 meetups,
                    and cybersecurity summits — if it matters to developers, you&apos;ll find it here.
                </p>
                <p>
                    No more hunting across dozens of websites and Twitter threads. DevEvent is your
                    single source of truth for what&apos;s happening in the developer world.
                </p>
            </article>

            {/* Our Mission */}
            <article className="flex-col-gap-2">
                <h2><strong>Our Mission</strong></h2>
                <p>
                    The developer world moves fast. New frameworks, tools, and ideas emerge every
                    week — and the best way to stay ahead is to <strong>connect with the community in person</strong>.
                </p>
                <p>
                    DevEvent exists to make sure you never miss the events that matter, whether
                    you&apos;re a frontend engineer, a DevOps specialist, a data scientist, or just
                    starting your journey. We believe the best learning happens when developers
                    get in the same room — or the same virtual space.
                </p>
            </article>

            {/* What We Cover */}
            <article className="flex-col-gap-2">
                <h2><strong>What We Cover</strong></h2>
                <p>
                    DevEvent spans the full spectrum of modern software development. Whatever your
                    stack or specialty, there&apos;s an event here for you.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {topics.map((topic) => (
                        <span key={topic} className="pill">{topic}</span>
                    ))}
                </div>
            </article>

            {/* Event Types */}
            <article className="flex-col-gap-2">
                <h2><strong>Event Types</strong></h2>
                <p>
                    DevEvent features three core event formats — available <strong>in-person, online,
                    and hybrid</strong> — spanning cities across the US and beyond.
                </p>
                <div className="flex flex-col gap-4 mt-2">
                    {eventTypes.map(({ icon, title, description }) => (
                        <div key={title} className="flex flex-col gap-1">
                            <h3><strong>{icon} {title}</strong></h3>
                            <p>{description}</p>
                        </div>
                    ))}
                </div>
            </article>

            {/* Who It's For */}
            <article className="flex-col-gap-2">
                <h2><strong>Who Is DevEvent For?</strong></h2>
                <p>
                    DevEvent is built for <strong>every developer</strong> — from students attending
                    their first hackathon to senior engineers looking for niche conferences in their domain.
                    If you write code, ship products, or lead engineering teams, DevEvent is for you.
                </p>
            </article>

        </section>
    );
};

export default AboutPage;