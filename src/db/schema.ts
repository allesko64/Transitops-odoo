import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  date,
  check,
} from "drizzle-orm/pg-core";

// FROZEN — no changes without a decision. See MASTER_TRACKER.md Phase 0.3.

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "truck",
  "van",
  "pickup",
  "trailer",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "on_trip",
  "in_shop",
  "retired",
]);

export const driverStatusEnum = pgEnum("driver_status", [
  "available",
  "on_trip",
  "suspended",
]);

export const tripStatusEnum = pgEnum("trip_status", [
  "draft",
  "dispatched",
  "completed",
  "cancelled",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "open",
  "closed",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "toll",
  "parking",
  "fine",
  "permit",
  "other",
]);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    registrationNumber: text("registration_number").notNull().unique(),
    type: vehicleTypeEnum("type").notNull(),
    capacityKg: integer("capacity_kg").notNull(),
    region: text("region").notNull(),
    status: vehicleStatusEnum("status").notNull().default("available"),
    odometer: integer("odometer").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [check("vehicles_capacity_positive", sql`${table.capacityKg} > 0`)]
);

export const drivers = pgTable(
  "drivers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    licenseNumber: text("license_number").notNull().unique(),
    licenseCategory: text("license_category").notNull(),
    licenseExpiry: date("license_expiry", { mode: "string" }).notNull(),
    safetyScore: integer("safety_score").notNull().default(100),
    status: driverStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "drivers_safety_score_range",
      sql`${table.safetyScore} >= 0 AND ${table.safetyScore} <= 100`
    ),
  ]
);

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => drivers.id),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    cargoKg: integer("cargo_kg").notNull(),
    plannedDistanceKm: numeric("planned_distance_km", {
      precision: 10,
      scale: 2,
    }).notNull(),
    status: tripStatusEnum("status").notNull().default("draft"),
    startOdometer: integer("start_odometer"),
    endOdometer: integer("end_odometer"),
    revenue: numeric("revenue", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (table) => [
    check("trips_cargo_positive", sql`${table.cargoKg} > 0`),
    check(
      "trips_end_odometer_after_start",
      sql`${table.endOdometer} IS NULL OR ${table.startOdometer} IS NULL OR ${table.endOdometer} >= ${table.startOdometer}`
    ),
  ]
);

export const maintenanceLogs = pgTable(
  "maintenance_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    description: text("description").notNull(),
    cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
    status: maintenanceStatusEnum("status").notNull().default("open"),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [check("maintenance_cost_nonnegative", sql`${table.cost} >= 0`)]
);

export const fuelLogs = pgTable(
  "fuel_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    tripId: uuid("trip_id").references(() => trips.id),
    liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("fuel_liters_positive", sql`${table.liters} > 0`),
    check("fuel_cost_nonnegative", sql`${table.cost} >= 0`),
  ]
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    tripId: uuid("trip_id").references(() => trips.id),
    category: expenseCategoryEnum("category").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    note: text("note"),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [check("expense_amount_positive", sql`${table.amount} > 0`)]
);

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type NewMaintenanceLog = typeof maintenanceLogs.$inferInsert;
export type FuelLog = typeof fuelLogs.$inferSelect;
export type NewFuelLog = typeof fuelLogs.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
