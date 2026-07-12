import { expenseCategoryEnum } from "@/db/schema";

export const EXPENSE_CATEGORY_LABELS: Record<
  (typeof expenseCategoryEnum.enumValues)[number],
  string
> = {
  toll: "Toll",
  parking: "Parking",
  fine: "Fine",
  permit: "Permit",
  other: "Other",
};
