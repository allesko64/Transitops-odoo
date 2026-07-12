import { z } from "zod";
import { expenseCategoryEnum } from "@/db/schema";

export const fuelLogFormSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional().default(""),
  liters: z.coerce
    .number()
    .gt(0, "Liters must be greater than 0"),
  cost: z.coerce
    .number()
    .min(0, "Cost must be 0 or more"),
  date: z.string().min(1, "Date is required"),
});

export type FuelLogFormInput = z.input<typeof fuelLogFormSchema>;
export type FuelLogFormValues = z.output<typeof fuelLogFormSchema>;

export const expenseFormSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional().default(""),
  category: z.enum(expenseCategoryEnum.enumValues),
  amount: z.coerce
    .number()
    .gt(0, "Amount must be greater than 0"),
  note: z.string().optional().default(""),
  date: z.string().min(1, "Date is required"),
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
