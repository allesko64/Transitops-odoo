import type { Driver } from "@/db/schema";

export type LicenseReminder = {
  driverId: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  daysUntilExpiry: number;
  status: "expired" | "expiring";
};

// Expired (days < 0) or expiring within 30 days, soonest first. Matches the
// red/amber threshold already used for the expiry cell on /drivers.
export function computeLicenseReminders(
  drivers: Pick<Driver, "id" | "name" | "licenseNumber" | "licenseExpiry">[],
  today: string
): LicenseReminder[] {
  return drivers
    .map((d) => {
      const daysUntilExpiry = Math.round(
        (new Date(d.licenseExpiry + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return {
        driverId: d.id,
        name: d.name,
        licenseNumber: d.licenseNumber,
        licenseExpiry: d.licenseExpiry,
        daysUntilExpiry,
        status: (daysUntilExpiry < 0 ? "expired" : "expiring") as "expired" | "expiring",
      };
    })
    .filter((r) => r.daysUntilExpiry <= 30)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
