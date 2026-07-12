"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { trips, vehicles, drivers, fuelLogs } from "@/db/schema";
import { requireRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";
import {
  createTripSchema,
  completeTripSchema,
  type CreateTripValues,
  type CompleteTripValues,
} from "@/lib/validations/trip";

const ALLOWED_ROLES: Role[] = ["admin", "dispatcher"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function createTrip(input: CreateTripValues) {
  await requireRole(ALLOWED_ROLES);
  const data = createTripSchema.parse(input);

  const [vehicle] = await db
    .select({ capacityKg: vehicles.capacityKg })
    .from(vehicles)
    .where(eq(vehicles.id, data.vehicleId));

  if (!vehicle) {
    throw new Error("Selected vehicle no longer exists.");
  }
  if (data.cargoKg > vehicle.capacityKg) {
    throw new Error("Cargo exceeds vehicle capacity.");
  }

  await db.insert(trips).values({
    vehicleId: data.vehicleId,
    driverId: data.driverId,
    origin: data.origin,
    destination: data.destination,
    cargoKg: data.cargoKg,
    plannedDistanceKm: data.plannedDistanceKm.toString(),
    status: "draft",
  });

  revalidatePath("/trips");
}

export async function dispatchTrip(tripId: string) {
  await requireRole(ALLOWED_ROLES);

  await db.transaction(async (tx) => {
    const [trip] = await tx.select().from(trips).where(eq(trips.id, tripId));
    if (!trip || trip.status !== "draft") {
      throw new Error("Trip is not a draft and cannot be dispatched.");
    }

    const [driver] = await tx.select().from(drivers).where(eq(drivers.id, trip.driverId));
    if (!driver) {
      throw new Error("Driver no longer exists.");
    }
    if (driver.licenseExpiry <= today()) {
      throw new Error("Driver's license has expired.");
    }

    const [vehicle] = await tx.select().from(vehicles).where(eq(vehicles.id, trip.vehicleId));
    if (!vehicle) {
      throw new Error("Vehicle no longer exists.");
    }
    if (trip.cargoKg > vehicle.capacityKg) {
      throw new Error("Cargo exceeds vehicle capacity.");
    }

    const [lockedVehicle] = await tx
      .update(vehicles)
      .set({ status: "on_trip" })
      .where(and(eq(vehicles.id, trip.vehicleId), eq(vehicles.status, "available")))
      .returning({ odometer: vehicles.odometer });

    if (!lockedVehicle) {
      throw new Error("Vehicle is no longer available.");
    }

    const [lockedDriver] = await tx
      .update(drivers)
      .set({ status: "on_trip" })
      .where(and(eq(drivers.id, trip.driverId), eq(drivers.status, "available")))
      .returning({ id: drivers.id });

    if (!lockedDriver) {
      throw new Error("Driver is no longer available.");
    }

    await tx
      .update(trips)
      .set({
        status: "dispatched",
        startOdometer: lockedVehicle.odometer,
        dispatchedAt: new Date(),
      })
      .where(eq(trips.id, tripId));
  });

  revalidatePath("/trips");
}

export async function completeTrip(tripId: string, input: CompleteTripValues) {
  await requireRole(ALLOWED_ROLES);
  const data = completeTripSchema.parse(input);

  await db.transaction(async (tx) => {
    const [trip] = await tx.select().from(trips).where(eq(trips.id, tripId));
    if (!trip || trip.status !== "dispatched") {
      throw new Error("Trip must be dispatched before it can be completed.");
    }
    if (trip.startOdometer !== null && data.endOdometer < trip.startOdometer) {
      throw new Error("End odometer cannot be less than start odometer.");
    }

    const [updatedTrip] = await tx
      .update(trips)
      .set({
        status: "completed",
        endOdometer: data.endOdometer,
        revenue: data.revenue !== undefined ? data.revenue.toString() : null,
        completedAt: new Date(),
      })
      .where(and(eq(trips.id, tripId), eq(trips.status, "dispatched")))
      .returning({ id: trips.id });

    if (!updatedTrip) {
      throw new Error("Trip must be dispatched before it can be completed.");
    }

    await tx
      .update(vehicles)
      .set({ status: "available", odometer: data.endOdometer })
      .where(eq(vehicles.id, trip.vehicleId));

    await tx.update(drivers).set({ status: "available" }).where(eq(drivers.id, trip.driverId));

    if (data.fuelLiters !== undefined && data.fuelCost !== undefined) {
      await tx.insert(fuelLogs).values({
        vehicleId: trip.vehicleId,
        tripId: trip.id,
        liters: data.fuelLiters.toString(),
        cost: data.fuelCost.toString(),
        date: today(),
      });
    }
  });

  revalidatePath("/trips");
}

export async function cancelTrip(tripId: string) {
  await requireRole(ALLOWED_ROLES);

  await db.transaction(async (tx) => {
    const [trip] = await tx.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) {
      throw new Error("Trip not found.");
    }
    if (trip.status === "completed" || trip.status === "cancelled") {
      throw new Error("Trip is already completed or cancelled.");
    }

    const [updated] = await tx
      .update(trips)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(
        and(eq(trips.id, tripId), ne(trips.status, "completed"), ne(trips.status, "cancelled"))
      )
      .returning({ id: trips.id });

    if (!updated) {
      throw new Error("Trip is already completed or cancelled.");
    }

    if (trip.status === "dispatched") {
      await tx.update(vehicles).set({ status: "available" }).where(eq(vehicles.id, trip.vehicleId));
      await tx.update(drivers).set({ status: "available" }).where(eq(drivers.id, trip.driverId));
    }
  });

  revalidatePath("/trips");
}
