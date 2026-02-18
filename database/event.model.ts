import mongoose, { Schema, Document, Model } from "mongoose";
import { Key } from "readline";

// TypeScript interface for Event document
export interface IEvent extends Document {
  id: Key | null | undefined;
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
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: ["online", "offline", "hybrid"],
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Agenda must have at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Tags must have at least one item",
      },
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt
  }
);

/**
 * Generates a URL-friendly slug from a string.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove consecutive hyphens
}

/**
 * Normalizes date string to ISO format (YYYY-MM-DD).
 * Throws error if date is invalid.
 */
function normalizeDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return parsed.toISOString().split("T")[0];
}

/**
 * Normalizes time to 24-hour format (HH:MM).
 * Accepts various formats like "2:30 PM", "14:30", "2:30pm".
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim().toUpperCase();

  // Check if already in 24-hour format (HH:MM)
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    if (hours >= 0 && hours <= 23) {
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }
  }

  // Parse 12-hour format (e.g., "2:30 PM", "2:30PM")
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const period = match12[3];

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  throw new Error(`Invalid time format: ${timeStr}`);
}

/**
 * Pre-save hook to:
 * 1. Generate slug from title (only if title changed or new document)
 * 2. Normalize date to ISO format
 * 3. Normalize time to 24-hour format
 */
EventSchema.pre("save", async function () {
  if (this.isModified("title") || this.isNew) {
    this.slug = generateSlug(this.title);

    const existingEvent = await mongoose.models.Event?.findOne({
      slug: this.slug,
      _id: { $ne: this._id },
    });

    if (existingEvent) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }

  if (this.isModified("date") || this.isNew) {
    this.date = normalizeDate(this.date);
  }

  if (this.isModified("time") || this.isNew) {
    this.time = normalizeTime(this.time);
  }
});


// Prevent model recompilation during hot reload in development
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
