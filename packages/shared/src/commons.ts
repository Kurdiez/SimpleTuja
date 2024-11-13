import { z } from "zod";

// Base schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

export const sortOrderSchema = z.enum(["ASC", "DESC"]);

export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: sortOrderSchema.optional(),
});

// Schema creators
export const createPaginatedRequestSchema = <T extends z.AnyZodObject>(
  requestSpecificSchema: T
) => paginationSchema.merge(sortingSchema).merge(requestSpecificSchema);

export const createPaginatedResponseSchema = <T extends z.ZodType>(
  itemSchema: T
) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// Types
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SortingParams = z.infer<typeof sortingSchema>;
