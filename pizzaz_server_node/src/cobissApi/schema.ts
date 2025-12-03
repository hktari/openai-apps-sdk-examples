import { z } from "zod";

export const cobissApiRequestSchema = z.object({
  title: z.string().describe("Book title to search for"),
  library_id: z.string().describe("Library ID to search in"),
  author: z.string().describe("Book author to search for").optional(),
});

// Zod schema for runtime validation
export const cobissApiResponseSchema = z.object({
  found: z
    .boolean()
    .describe("Whether any books matching the search were found"),
  query: z.string().describe("The search query used"),
  library_id: z.string().describe("The library ID searched"),
  total_results: z.number().describe("Total number of matching books found"),
  books_checked: z
    .number()
    .describe("Number of books checked for availability"),
  any_available: z
    .boolean()
    .describe("Whether any of the books are currently available"),
  books: z
    .array(
      z.object({
        id: z.string().describe("COBISS book ID"),
        title: z.string().describe("Book title"),
        author: z.string().describe("Book author"),
        details: z
          .string()
          .describe("Additional details (format, language, year)"),
        cover_url: z.string().describe("URL to book cover image"),
        material_type: z.string().describe("Type of material"),
        is_available: z
          .boolean()
          .describe("Whether the book is currently available"),
        availability: z
          .array(
            z.object({
              status: z
                .string()
                .describe("Availability status (FREE, LOANED, etc.)"),
              description: z
                .string()
                .describe("Human-readable availability description"),
              inventory_number: z.string().describe("Library inventory number"),
              location: z.string().describe("Physical location code"),
              signature_text: z.string().describe("Full call number/signature"),
              can_reserve: z
                .boolean()
                .describe("Whether reservation is possible"),
              approx_return_date: z
                .string()
                .optional()
                .describe("Expected return date if loaned"),
              pickup_locations: z
                .array(z.string())
                .optional()
                .describe("Available pickup locations"),
            })
          )
          .describe("Availability details for each copy"),
      })
    )
    .describe("List of books with availability information"),
});

// TypeScript types derived from the schema
export type CobissApiResponse = z.infer<typeof cobissApiResponseSchema>;
export type CobissApiRequest = z.infer<typeof cobissApiRequestSchema>;

export type Book = {
  id: string;
  title: string;
  author: string;
  details: string;
  cover_url: string;
  material_type: string;
  is_available: boolean;
  availability: Availability[];
};

export type Availability = {
  status: string;
  description: string;
  inventory_number: string;
  location: string;
  signature_text: string;
  can_reserve: boolean;
  approx_return_date?: string;
  pickup_locations?: string[];
};
