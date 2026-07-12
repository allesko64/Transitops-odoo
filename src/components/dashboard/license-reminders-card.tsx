"use client";

import { useState } from "react";
import { toast } from "sonner";

import { notifyDriverLicenseExpiry } from "@/actions/notifications";
import type { Role } from "@/lib/auth-roles";
import type { LicenseReminder } from "@/lib/license-reminders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

function expiryLabel(reminder: LicenseReminder) {
  if (reminder.status === "expired") {
    const days = Math.abs(reminder.daysUntilExpiry);
    return `Expired ${days} day${days === 1 ? "" : "s"} ago`;
  }
  return `Expires in ${reminder.daysUntilExpiry} day${reminder.daysUntilExpiry === 1 ? "" : "s"}`;
}

export function LicenseRemindersCard({
  reminders,
  role,
}: {
  reminders: LicenseReminder[];
  role: Role;
}) {
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const canNotify = role === "admin" || role === "safety_officer";

  async function handleNotify(driverId: string) {
    setNotifyingId(driverId);
    try {
      await notifyDriverLicenseExpiry(driverId);
      toast.success("Notification logged (email transport is stubbed — check server console)");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send notification");
    } finally {
      setNotifyingId(null);
    }
  }

  if (reminders.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>License Expiry Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2">
          {reminders.map((r) => (
            <li
              key={r.driverId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <StatusBadge tone={r.status === "expired" ? "red" : "amber"}>
                  {expiryLabel(r)}
                </StatusBadge>
                <span className="text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.licenseNumber}</span>
              </div>
              {canNotify && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={notifyingId === r.driverId}
                  onClick={() => handleNotify(r.driverId)}
                >
                  {notifyingId === r.driverId ? "Sending..." : "Notify"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
