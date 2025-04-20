import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * @param {...any} inputs - Class name inputs
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random anonymous username
 * @returns {string} Random username combining adjective, noun, and number
 */
export function generateUsername() {
  const adjectives = [
    "Happy",
    "Brave",
    "Calm",
    "Wise",
    "Kind",
    "Gentle",
    "Peaceful",
    "Hopeful",
    "Caring",
    "Bright",
    "Serene",
    "Mindful",
    "Joyful",
    "Tranquil",
    "Thoughtful",
  ];

  const nouns = [
    "Soul",
    "Mind",
    "Heart",
    "Spirit",
    "Journey",
    "Path",
    "Horizon",
    "Meadow",
    "Ocean",
    "River",
    "Mountain",
    "Forest",
    "Star",
    "Sunset",
    "Breeze",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

/**
 * Formats a date with fallback for invalid dates
 * @param {Date|string|number} date - Date to format
 * @param {string} [formatStr="MMM d, yyyy"] - Format string (default: "MMM d, yyyy")
 * @returns {string} Formatted date or error message
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatStr: string = "MMM d, yyyy"
): string {
  if (!date) return "Unknown date";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return dateObj.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}
