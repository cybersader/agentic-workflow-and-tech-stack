import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { z } from "astro:content";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Stratum classification (1-5)
        stratum: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional()
          .or(z.enum(["1", "2", "3", "4", "5"]).optional()),
        // Status lifecycle
        // - draft:     content exists but isn't ready (template skeletons, WIP)
        // - research:  actively investigating; conclusions not yet drawn
        // - aligning:  needs review / consensus before moving forward
        // - planning:  work scoped, not yet started
        // - active:    convention or index in current use, accepts ongoing updates
        // - observed:  point-in-time empirical capture; fact, not ongoing investigation
        // - log:       append-as-you-go record (worklogs); each entry stable once written
        // - stable:    finished, won't change without deliberate revision
        // - parked:    paused, may resume later
        status: z.enum([
          "draft", "research", "aligning", "planning",
          "active", "observed", "log",
          "stable", "parked",
        ]).optional(),
        // Authoring date (string or YAML-parsed Date)
        date: z.union([z.string(), z.date()]).optional()
          .transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d)),
        // Tags for discovery
        tags: z.array(z.string()).optional(),
      }),
    }),
  }),
};
