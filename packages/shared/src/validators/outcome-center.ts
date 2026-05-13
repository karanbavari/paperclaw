import { z } from "zod";
import {
  issueWorkProductReviewStateSchema,
  issueWorkProductStatusSchema,
  issueWorkProductTypeSchema,
} from "./work-product.js";

const optionalQueryString = z.preprocess(
  (value) => Array.isArray(value) ? value[0] : value,
  z.string().trim().min(1).optional(),
);

export const outcomeCenterQuerySchema = z.object({
  type: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    issueWorkProductTypeSchema.optional(),
  ),
  status: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    issueWorkProductStatusSchema.optional(),
  ),
  reviewState: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    issueWorkProductReviewStateSchema.optional(),
  ),
  projectId: optionalQueryString,
  q: optionalQueryString,
  limit: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    z.coerce.number().int().min(1).max(500).optional().default(100),
  ),
});

export type OutcomeCenterQuery = z.infer<typeof outcomeCenterQuerySchema>;
