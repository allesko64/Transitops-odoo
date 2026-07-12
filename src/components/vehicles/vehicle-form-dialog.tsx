"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createVehicle, updateVehicle } from "@/actions/vehicles";
import {
  vehicleFormSchema,
  type VehicleFormInput,
  type VehicleFormValues,
} from "@/lib/validations/vehicle";
import { vehicleTypeEnum, type Vehicle } from "@/db/schema";
import { VEHICLE_TYPE_LABELS } from "@/lib/labels/vehicle";
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

function defaultValuesFor(vehicle?: Vehicle): VehicleFormInput {
  return {
    registrationNumber: vehicle?.registrationNumber ?? "",
    type: vehicle?.type ?? "truck",
    capacityKg: vehicle ? vehicle.capacityKg : "",
    region: vehicle?.region ?? "",
  };
}

export function VehicleFormDialog({
  trigger,
  vehicle,
}: {
  trigger: React.ReactElement;
  vehicle?: Vehicle;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!vehicle;

  const form = useForm<VehicleFormInput, unknown, VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: defaultValuesFor(vehicle),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(defaultValuesFor(vehicle));
    }
  }

  async function onSubmit(values: VehicleFormValues) {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateVehicle(vehicle.id, values);
        toast.success("Vehicle updated");
      } else {
        await createVehicle(values);
        toast.success("Vehicle registered");
      }
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      if (message.toLowerCase().includes("registration number")) {
        form.setError("registrationNumber", { message });
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Vehicle" : "Register Vehicle"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this vehicle's details."
              : "Add a new vehicle to the fleet."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="MH12AB1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleTypeEnum.enumValues.map((type) => (
                        <SelectItem key={type} value={type}>
                          {VEHICLE_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacityKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000"
                      {...field}
                      value={field.value as number | string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="Delhi NCR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
