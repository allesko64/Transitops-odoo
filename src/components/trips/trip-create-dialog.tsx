"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createTrip } from "@/actions/trips";
import {
  createTripSchema,
  type CreateTripInput,
  type CreateTripValues,
} from "@/lib/validations/trip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AvailableVehicle = {
  id: string;
  registrationNumber: string;
  capacityKg: number;
};

export type AvailableDriver = {
  id: string;
  name: string;
};

const EMPTY_VALUES: CreateTripInput = {
  vehicleId: "",
  driverId: "",
  origin: "",
  destination: "",
  cargoKg: "",
  plannedDistanceKm: "",
};

export function TripCreateDialog({
  trigger,
  vehicles,
  drivers,
}: {
  trigger: React.ReactElement;
  vehicles: AvailableVehicle[];
  drivers: AvailableDriver[];
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTripInput, unknown, CreateTripValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: EMPTY_VALUES,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(EMPTY_VALUES);
    }
  }

  async function onSubmit(values: CreateTripValues) {
    setIsSubmitting(true);
    try {
      await createTrip(values);
      toast.success("Trip saved as draft");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create trip");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedVehicleId = form.watch("vehicleId");
  const cargoKg = form.watch("cargoKg");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const cargoNumber = Number(cargoKg as number | string);
  const isOverweight =
    !!selectedVehicle && Number.isFinite(cargoNumber) && cargoNumber > selectedVehicle.capacityKg;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Trip</DialogTitle>
          <DialogDescription>Saved as a draft until dispatched.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an available vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No available vehicles
                        </div>
                      ) : (
                        vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.registrationNumber} · {v.capacityKg.toLocaleString()} kg
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an available driver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivers.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No available drivers
                        </div>
                      ) : (
                        drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="Delhi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="Jaipur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="cargoKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="3000"
                      {...field}
                      value={field.value as number | string}
                    />
                  </FormControl>
                  {selectedVehicle && (
                    <p
                      className={cn(
                        "text-sm",
                        isOverweight ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      Vehicle capacity: {selectedVehicle.capacityKg.toLocaleString()} kg
                      {isOverweight ? " — exceeds capacity" : ""}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plannedDistanceKm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Distance (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="280"
                      {...field}
                      value={field.value as number | string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Draft"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
