import { z, defineCollection } from "astro:content";

const collection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    order: z.number(),
    id: z.string(),
  }),
});

export const collections = {
  overview: collection,
  "power-levels": collection,
  assumptions: collection,
  "rule-zero": collection,
  "deckbuilding-overview": collection,
  "deckbuilding-template": collection,
  "deckbuilding-card-advantage": collection,
  "deckbuilding-interaction": collection,
  "deckbuilding-ramp": collection,
  "influences-overview": collection,
  "influences-strategies": collection,
  "influences-combos": collection,
  "influences-tutors": collection,
  "influences-threat-levels": collection,
};
