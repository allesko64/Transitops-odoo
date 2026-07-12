"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { openMaintenance } from "@/actions/maintenance";
import {
  openMaintenanceSchema,
  type OpenMaintenanceInput,
  type OpenMaintenanceValues,
} from "@/lib/validations/maintenance";
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

export type EligibleVehicle = {
  id: string;
  registrationNumber: string;
};

const EMPTY_VALUES: OpenMaintenanceInput = {
  vehicleId: "",
  description: "",
  cost: "",
};

export function MaintenanceOpenDialog({
  trigger,
  vehicles,
}: {
  trigger: React.ReactElement;
  vehicles: EligibleVehicle[];
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OpenMaintenanceInput, unknown, OpenMaintenanceValues>({
    resolver: zodResolver(openMaintenanceSchema),
    defaultValues: EMPTY_VALUES,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(EMPTY_VALUES);
    }
  }

  async function onSubmit(values: OpenMaintenanceValues) {
    setIsSubmitting(true);
    try {
      await openMaintenance(values);
      toast.success("Maintenance opened");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open maintenance");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Maintenance</DialogTitle>
          <DialogDescription>The vehicle will be marked as in the shop.</DialogDescription>
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
                            {v.registrationNumber}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brake pad replacement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="4500"
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
                {isSubmitting ? "Saving..." : "Open Maintenance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
