import { z } from 'zod';

export const monthlyReportSchema = z.object({
    query: z.object({
        month: z.coerce.number().int().min(1).max(12),
        year: z.coerce.number().int().min(2000),
        operation: z.string().min(1)
    })
});

export const dailyReportSchema = z.object({
    query: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        operation: z.string().min(1)
    })
});

export const clientTrackerSchema = z.object({
    query: z.object({
        refNo: z.string().min(1)
    })
});

export const contactSearchSchema = z.object({
    query: z.object({
        number: z.string().regex(/^\+?[0-9-]{2,20}$/, "Invalid contact number format. (at least 2 digits)")
    })
});
