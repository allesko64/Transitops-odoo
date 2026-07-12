import type { Role } from "../lib/auth-roles";
import type {
  vehicleTypeEnum,
  vehicleStatusEnum,
  driverStatusEnum,
  tripStatusEnum,
  maintenanceStatusEnum,
  expenseCategoryEnum,
} from "./schema";

type VehicleType = (typeof vehicleTypeEnum.enumValues)[number];
type VehicleStatus = (typeof vehicleStatusEnum.enumValues)[number];
type DriverStatus = (typeof driverStatusEnum.enumValues)[number];
type TripStatus = (typeof tripStatusEnum.enumValues)[number];
type MaintenanceStatus = (typeof maintenanceStatusEnum.enumValues)[number];
type ExpenseCategory = (typeof expenseCategoryEnum.enumValues)[number];

// All dates are anchored to "now" (script run time) so the seed stays
// realistic (expiring licenses, past-60-days fuel/expenses) no matter when
// it's run before the demo.
const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date();

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * DAY_MS);
}
function daysFromNow(n: number): Date {
  return new Date(NOW.getTime() + n * DAY_MS);
}
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: Role;
}

// Demo accounts — one per role. Passwords documented in README.md.
export const demoUsers: SeedUser[] = [
  { email: "admin@transitops.app", password: "Admin@12345", name: "Admin User", role: "admin" },
  { email: "fleetmanager@transitops.app", password: "Fleet@12345", name: "Fleet Manager", role: "fleet_manager" },
  { email: "dispatcher@transitops.app", password: "Dispatch@12345", name: "Ops Dispatcher", role: "dispatcher" },
  { email: "safety@transitops.app", password: "Safety@12345", name: "Safety Officer", role: "safety_officer" },
  { email: "finance@transitops.app", password: "Finance@12345", name: "Finance Analyst", role: "financial_analyst" },
];

export interface SeedVehicle {
  key: string;
  registrationNumber: string;
  type: VehicleType;
  capacityKg: number;
  region: string;
  status: VehicleStatus;
  odometer: number;
}

// 10 vehicles: 1 retired, 2 in_shop, 2 on_trip, 5 available.
// NOTE: "Van-05" is reserved for the live demo — never seed it here.
export const vehicles: SeedVehicle[] = [
  { key: "v1", registrationNumber: "DL01AB1001", type: "truck", capacityKg: 8000, region: "Delhi NCR", status: "available", odometer: 45540 },
  { key: "v2", registrationNumber: "MH12CD2002", type: "truck", capacityKg: 9000, region: "Mumbai", status: "on_trip", odometer: 62155 },
  { key: "v3", registrationNumber: "RJ14EF3003", type: "van", capacityKg: 1500, region: "Jaipur", status: "available", odometer: 28410 },
  { key: "v4", registrationNumber: "KA05GH4004", type: "pickup", capacityKg: 1000, region: "Bengaluru", status: "in_shop", odometer: 15200 },
  { key: "v5", registrationNumber: "PB10IJ5005", type: "trailer", capacityKg: 15000, region: "Punjab", status: "available", odometer: 88320 },
  { key: "v6", registrationNumber: "UP16KL6006", type: "truck", capacityKg: 7500, region: "Lucknow", status: "on_trip", odometer: 51095 },
  { key: "v7", registrationNumber: "GJ01MN7007", type: "van", capacityKg: 1800, region: "Ahmedabad", status: "available", odometer: 33270 },
  { key: "v8", registrationNumber: "HR26OP8008", type: "pickup", capacityKg: 1200, region: "Gurugram", status: "in_shop", odometer: 21000 },
  { key: "v9", registrationNumber: "TN09QR9009", type: "truck", capacityKg: 8500, region: "Chennai", status: "retired", odometer: 71510 },
  { key: "v10", registrationNumber: "WB20ST0010", type: "trailer", capacityKg: 16000, region: "Kolkata", status: "available", odometer: 40175 },
];

export interface SeedDriver {
  key: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  safetyScore: number;
  status: DriverStatus;
}

// 8 drivers: 1 expired license, 1 expiring in ~15 days, 1 suspended, 2 on_trip.
// NOTE: "Alex" is reserved for the live demo — never seed that name here.
export const drivers: SeedDriver[] = [
  { key: "d1", name: "Ramesh Kumar", licenseNumber: "DL-1420110012345", licenseCategory: "LMV+HMV", licenseExpiry: isoDate(daysFromNow(300)), safetyScore: 92, status: "available" },
  { key: "d2", name: "Suresh Yadav", licenseNumber: "MH-0220150067890", licenseCategory: "HMV", licenseExpiry: isoDate(daysAgo(90)), safetyScore: 78, status: "available" },
  { key: "d3", name: "Anita Sharma", licenseNumber: "RJ-1419980012399", licenseCategory: "LMV", licenseExpiry: isoDate(daysFromNow(15)), safetyScore: 88, status: "available" },
  { key: "d4", name: "Vikram Singh", licenseNumber: "PB-1020120054321", licenseCategory: "HMV", licenseExpiry: isoDate(daysFromNow(600)), safetyScore: 65, status: "suspended" },
  { key: "d5", name: "Manoj Tiwari", licenseNumber: "UP-3220160098765", licenseCategory: "HMV", licenseExpiry: isoDate(daysFromNow(500)), safetyScore: 90, status: "on_trip" },
  { key: "d6", name: "Deepak Verma", licenseNumber: "MH-1220140011122", licenseCategory: "HMV", licenseExpiry: isoDate(daysFromNow(400)), safetyScore: 85, status: "on_trip" },
  { key: "d7", name: "Farhan Ali", licenseNumber: "GJ-0120170033445", licenseCategory: "LMV", licenseExpiry: isoDate(daysFromNow(900)), safetyScore: 95, status: "available" },
  { key: "d8", name: "Priya Nair", licenseNumber: "TN-0920130055667", licenseCategory: "LMV+HMV", licenseExpiry: isoDate(daysFromNow(200)), safetyScore: 91, status: "available" },
];

export interface SeedTrip {
  key: string;
  vehicleKey: string;
  driverKey: string;
  origin: string;
  destination: string;
  cargoKg: number;
  plannedDistanceKm: number;
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  revenue?: number;
  createdAt: Date;
  dispatchedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

// 15 trips: 2 draft, 2 dispatched, 9 completed, 2 cancelled.
// Odometer chains and vehicle.odometer above are kept internally consistent
// (each trip's startOdometer == previous trip's endOdometer for that vehicle).
// Revenue is tuned so v1/v3/v7 read profitable and v5 reads loss-making
// once fuel + maintenance costs are netted against it.
export const trips: SeedTrip[] = [
  { key: "t1", vehicleKey: "v1", driverKey: "d1", origin: "Delhi", destination: "Jaipur", cargoKg: 3000, plannedDistanceKm: 280, status: "completed", startOdometer: 45000, endOdometer: 45285, revenue: 18500, createdAt: daysAgo(40), dispatchedAt: daysAgo(40), completedAt: daysAgo(38) },
  { key: "t2", vehicleKey: "v1", driverKey: "d1", origin: "Delhi", destination: "Chandigarh", cargoKg: 4500, plannedDistanceKm: 250, status: "completed", startOdometer: 45285, endOdometer: 45540, revenue: 16200, createdAt: daysAgo(20), dispatchedAt: daysAgo(20), completedAt: daysAgo(19) },
  { key: "t3", vehicleKey: "v1", driverKey: "d7", origin: "Delhi", destination: "Agra", cargoKg: 2000, plannedDistanceKm: 210, status: "cancelled", createdAt: daysAgo(5), cancelledAt: daysAgo(5) },
  { key: "t4", vehicleKey: "v2", driverKey: "d6", origin: "Mumbai", destination: "Pune", cargoKg: 5000, plannedDistanceKm: 150, status: "completed", startOdometer: 62000, endOdometer: 62155, revenue: 9800, createdAt: daysAgo(30), dispatchedAt: daysAgo(30), completedAt: daysAgo(29) },
  { key: "t5", vehicleKey: "v2", driverKey: "d6", origin: "Mumbai", destination: "Nashik", cargoKg: 4000, plannedDistanceKm: 180, status: "dispatched", startOdometer: 62155, createdAt: daysAgo(1), dispatchedAt: daysAgo(1) },
  { key: "t6", vehicleKey: "v3", driverKey: "d3", origin: "Jaipur", destination: "Ajmer", cargoKg: 800, plannedDistanceKm: 130, status: "draft", createdAt: daysAgo(2) },
  { key: "t7", vehicleKey: "v3", driverKey: "d3", origin: "Jaipur", destination: "Udaipur", cargoKg: 1200, plannedDistanceKm: 400, status: "completed", startOdometer: 28000, endOdometer: 28410, revenue: 7200, createdAt: daysAgo(15), dispatchedAt: daysAgo(15), completedAt: daysAgo(14) },
  { key: "t8", vehicleKey: "v5", driverKey: "d4", origin: "Ludhiana", destination: "Delhi", cargoKg: 12000, plannedDistanceKm: 310, status: "completed", startOdometer: 88000, endOdometer: 88320, revenue: 9000, createdAt: daysAgo(25), dispatchedAt: daysAgo(25), completedAt: daysAgo(24) },
  { key: "t9", vehicleKey: "v6", driverKey: "d5", origin: "Lucknow", destination: "Kanpur", cargoKg: 5500, plannedDistanceKm: 90, status: "completed", startOdometer: 51000, endOdometer: 51095, revenue: 5200, createdAt: daysAgo(18), dispatchedAt: daysAgo(18), completedAt: daysAgo(17) },
  { key: "t10", vehicleKey: "v6", driverKey: "d5", origin: "Lucknow", destination: "Varanasi", cargoKg: 6000, plannedDistanceKm: 320, status: "dispatched", startOdometer: 51095, createdAt: daysAgo(2), dispatchedAt: daysAgo(2) },
  { key: "t11", vehicleKey: "v7", driverKey: "d7", origin: "Ahmedabad", destination: "Surat", cargoKg: 1400, plannedDistanceKm: 265, status: "completed", startOdometer: 33000, endOdometer: 33270, revenue: 6100, createdAt: daysAgo(22), dispatchedAt: daysAgo(22), completedAt: daysAgo(21) },
  { key: "t12", vehicleKey: "v7", driverKey: "d8", origin: "Ahmedabad", destination: "Rajkot", cargoKg: 900, plannedDistanceKm: 220, status: "cancelled", createdAt: daysAgo(6), cancelledAt: daysAgo(6) },
  { key: "t13", vehicleKey: "v9", driverKey: "d2", origin: "Chennai", destination: "Coimbatore", cargoKg: 6000, plannedDistanceKm: 500, status: "completed", startOdometer: 71000, endOdometer: 71510, revenue: 15000, createdAt: daysAgo(58), dispatchedAt: daysAgo(58), completedAt: daysAgo(56) },
  { key: "t14", vehicleKey: "v10", driverKey: "d8", origin: "Kolkata", destination: "Durgapur", cargoKg: 9000, plannedDistanceKm: 170, status: "completed", startOdometer: 40000, endOdometer: 40175, revenue: 8800, createdAt: daysAgo(12), dispatchedAt: daysAgo(12), completedAt: daysAgo(11) },
  { key: "t15", vehicleKey: "v10", driverKey: "d1", origin: "Kolkata", destination: "Asansol", cargoKg: 7000, plannedDistanceKm: 210, status: "draft", createdAt: daysAgo(1) },
];

export interface SeedFuelLog {
  vehicleKey: string;
  tripKey?: string;
  liters: number;
  cost: number;
  date: string;
}

// ~90/L average, spread across the last 60 days. v8 deliberately has none
// (exercises the "zero-fuel vehicle" divide-by-zero case in analytics).
export const fuelLogs: SeedFuelLog[] = [
  { vehicleKey: "v1", tripKey: "t1", liters: 60, cost: 5400, date: isoDate(daysAgo(38)) },
  { vehicleKey: "v1", tripKey: "t2", liters: 55, cost: 4950, date: isoDate(daysAgo(19)) },
  { vehicleKey: "v2", tripKey: "t4", liters: 40, cost: 3600, date: isoDate(daysAgo(29)) },
  { vehicleKey: "v3", tripKey: "t7", liters: 35, cost: 3150, date: isoDate(daysAgo(14)) },
  { vehicleKey: "v4", liters: 25, cost: 2250, date: isoDate(daysAgo(50)) },
  { vehicleKey: "v5", tripKey: "t8", liters: 80, cost: 7200, date: isoDate(daysAgo(24)) },
  { vehicleKey: "v5", liters: 75, cost: 6750, date: isoDate(daysAgo(10)) },
  { vehicleKey: "v6", tripKey: "t9", liters: 50, cost: 4500, date: isoDate(daysAgo(17)) },
  { vehicleKey: "v7", tripKey: "t11", liters: 30, cost: 2700, date: isoDate(daysAgo(21)) },
  { vehicleKey: "v9", tripKey: "t13", liters: 70, cost: 6300, date: isoDate(daysAgo(56)) },
  { vehicleKey: "v10", tripKey: "t14", liters: 45, cost: 4050, date: isoDate(daysAgo(11)) },
];

export interface SeedExpense {
  vehicleKey: string;
  tripKey?: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  date: string;
}

// One of each category, spread across the last 60 days.
export const expenses: SeedExpense[] = [
  { vehicleKey: "v1", tripKey: "t1", category: "toll", amount: 450, note: "NH48 toll", date: isoDate(daysAgo(38)) },
  { vehicleKey: "v1", tripKey: "t2", category: "parking", amount: 150, date: isoDate(daysAgo(19)) },
  { vehicleKey: "v2", category: "permit", amount: 2500, note: "State permit renewal", date: isoDate(daysAgo(29)) },
  { vehicleKey: "v3", tripKey: "t7", category: "toll", amount: 220, date: isoDate(daysAgo(14)) },
  { vehicleKey: "v5", tripKey: "t8", category: "fine", amount: 3000, note: "Overloading fine", date: isoDate(daysAgo(24)) },
  { vehicleKey: "v6", tripKey: "t9", category: "toll", amount: 180, date: isoDate(daysAgo(17)) },
  { vehicleKey: "v7", tripKey: "t11", category: "other", amount: 500, note: "Driver allowance", date: isoDate(daysAgo(21)) },
  { vehicleKey: "v9", tripKey: "t13", category: "toll", amount: 300, date: isoDate(daysAgo(56)) },
  { vehicleKey: "v10", tripKey: "t14", category: "toll", amount: 260, date: isoDate(daysAgo(11)) },
];

export interface SeedMaintenanceLog {
  vehicleKey: string;
  description: string;
  cost: number;
  status: MaintenanceStatus;
  openedAt: Date;
  closedAt?: Date;
}

// 2 open (matching the 2 in_shop vehicles) + 3 closed.
export const maintenanceLogs: SeedMaintenanceLog[] = [
  { vehicleKey: "v4", description: "Clutch plate replacement", cost: 6500, status: "open", openedAt: daysAgo(3) },
  { vehicleKey: "v8", description: "Brake system overhaul", cost: 9000, status: "open", openedAt: daysAgo(2) },
  { vehicleKey: "v2", description: "Minor service - oil change", cost: 2000, status: "closed", openedAt: daysAgo(35), closedAt: daysAgo(32) },
  { vehicleKey: "v5", description: "Tyre replacement + suspension repair", cost: 18000, status: "closed", openedAt: daysAgo(12), closedAt: daysAgo(8) },
  { vehicleKey: "v8", description: "AC repair", cost: 1500, status: "closed", openedAt: daysAgo(40), closedAt: daysAgo(38) },
];
