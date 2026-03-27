import { Event, Drink } from "./types";

export const SAMPLE_EVENTS: Event[] = [
  {
    id: "event-1",
    name: "Nairobi Night Live",
    date: "2026-04-15T20:00:00Z",
    venue: "Alchemist Bar, Westlands",
    description: "Experience the best of Nairobi's live music scene with top DJs and artists.",
    image: "https://picsum.photos/seed/nairobi/800/400",
    prices: {
      single: 1500,
      couple: 2500,
      group: 5000,
      vip: 4000
    }
  },
  {
    id: "event-2",
    name: "Coastal Vibes Festival",
    date: "2026-05-20T14:00:00Z",
    venue: "Haller Park, Mombasa",
    description: "A beachside festival celebrating culture, food, and music.",
    image: "https://picsum.photos/seed/mombasa/800/400",
    prices: {
      single: 2000,
      couple: 3500,
      group: 7000,
      vip: 5000
    }
  }
];

export const SAMPLE_DRINKS: Drink[] = [
  {
    id: "drink-1",
    name: "Tusker Lager",
    price: 350,
    category: "Alcoholic",
    description: "Kenya's finest lager.",
    image: "https://picsum.photos/seed/tusker/200/200"
  },
  {
    id: "drink-2",
    name: "Gilbey's Gin",
    price: 2500,
    category: "Premium",
    description: "Classic London dry gin.",
    image: "https://picsum.photos/seed/gin/200/200"
  },
  {
    id: "drink-3",
    name: "Coca Cola",
    price: 150,
    category: "Non-Alcoholic",
    description: "Refreshing soda.",
    image: "https://picsum.photos/seed/coke/200/200"
  },
  {
    id: "drink-4",
    name: "Jameson Whiskey",
    price: 4500,
    category: "Premium",
    description: "Smooth Irish whiskey.",
    image: "https://picsum.photos/seed/jameson/200/200"
  }
];
