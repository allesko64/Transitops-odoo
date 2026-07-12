import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import { user } from "./auth-schema";
import {
  vehicles as vehiclesTable,
  drivers as driversTable,
  trips as tripsTable,
  maintenanceLogs as maintenanceLogsTable,
  fuelLogs as fuelLogsTable,
  expenses as expensesTable,
} from "./schema";
import {
  demoUsers,
  vehicles,
  drivers,
  trips,
  fuelLogs,
  expenses,
  maintenanceLogs,
} from "./seed-data";

// Standalone instance (not src/lib/auth.ts) so this script has no dependency
// on the "@/..." path alias, which Next.js resolves but a bare tsx run does not.
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "dispatcher", input: false },
    },
  },
});

function money(n: number): string {
  return n.toFixed(2);
}

async function truncateAll() {
  await db.execute(sql`
    TRUNCATE TABLE
      fuel_logs, expenses, maintenance_logs, trips, drivers, vehicles,
      "session", "account", "verification", "user"
    CASCADE
  `);
}

async function seedUsers() {
  for (const u of demoUsers) {
    await auth.api.signUpEmail({ body: { name: u.name, email: u.email, password: u.password } });
    await db.update(user).set({ role: u.role }).where(eq(user.email, u.email));
  }
}

async function seedDomainData() {
  const vehicleIdByKey = new Map<string, string>();
  for (const v of vehicles) {
    const [row] = await db
      .insert(vehiclesTable)
      .values({
        registrationNumber: v.registrationNumber,
        type: v.type,
        capacityKg: v.capacityKg,
        region: v.region,
        status: v.status,
        odometer: v.odometer,
      })
      .returning({ id: vehiclesTable.id });
    vehicleIdByKey.set(v.key, row.id);
  }

  const driverIdByKey = new Map<string, string>();
  for (const d of drivers) {
    const [row] = await db
      .insert(driversTable)
      .values({
        name: d.name,
        licenseNumber: d.licenseNumber,
        licenseCategory: d.licenseCategory,
        licenseExpiry: d.licenseExpiry,
        safetyScore: d.safetyScore,
        status: d.status,
      })
      .returning({ id: driversTable.id });
    driverIdByKey.set(d.key, row.id);
  }

  const tripIdByKey = new Map<string, string>();
  for (const t of trips) {
    const [row] = await db
      .insert(tripsTable)
      .values({
        vehicleId: vehicleIdByKey.get(t.vehicleKey)!,
        driverId: driverIdByKey.get(t.driverKey)!,
        origin: t.origin,
        destination: t.destination,
        cargoKg: t.cargoKg,
        plannedDistanceKm: money(t.plannedDistanceKm),
        status: t.status,
        startOdometer: t.startOdometer ?? null,
        endOdometer: t.endOdometer ?? null,
        revenue: t.revenue !== undefined ? money(t.revenue) : null,
        createdAt: t.createdAt,
        dispatchedAt: t.dispatchedAt ?? null,
        completedAt: t.completedAt ?? null,
        cancelledAt: t.cancelledAt ?? null,
      })
      .returning({ id: tripsTable.id });
    tripIdByKey.set(t.key, row.id);
  }

  for (const f of fuelLogs) {
    await db.insert(fuelLogsTable).values({
      vehicleId: vehicleIdByKey.get(f.vehicleKey)!,
      tripId: f.tripKey ? tripIdByKey.get(f.tripKey)! : null,
      liters: money(f.liters),
      cost: money(f.cost),
      date: f.date,
    });
  }

  for (const e of expenses) {
    await db.insert(expensesTable).values({
      vehicleId: vehicleIdByKey.get(e.vehicleKey)!,
      tripId: e.tripKey ? tripIdByKey.get(e.tripKey)! : null,
      category: e.category,
      amount: money(e.amount),
      note: e.note ?? null,
      date: e.date,
    });
  }

  for (const m of maintenanceLogs) {
    await db.insert(maintenanceLogsTable).values({
      vehicleId: vehicleIdByKey.get(m.vehicleKey)!,
      description: m.description,
      cost: money(m.cost),
      status: m.status,
      openedAt: m.openedAt,
      closedAt: m.closedAt ?? null,
    });
  }
}

async function main() {
  console.log("Truncating tables...");
  await truncateAll();

  console.log("Seeding demo users...");
  await seedUsers();

  console.log("Seeding domain data...");
  await seedDomainData();

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
