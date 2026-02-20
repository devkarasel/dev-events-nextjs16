'use client';

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

const ExploreBtn = () => {
  const handleClick = () => {
    posthog.capture('explore_events_clicked');
  };

  return (
    <Link href="/events#events-list" id="explore-btn" className="mt-07 mx-auto" onClick={handleClick}>
      Explore Events
      <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
    </Link>
  );
};

export default ExploreBtn;