import { z } from "zod";

export const vehicleDocumentFormSchema = z.object({
  name: z.string().trim().min(1, "Document name is required"),
  url: z.url("Enter a valid URL"),
  expiryDate: z.string().trim().optional().or(z.literal("")),
});

export type VehicleDocumentFormInput = z.input<typeof vehicleDocumentFormSchema>;
export type VehicleDocumentFormValues = z.output<typeof vehicleDocumentFormSchema>;
