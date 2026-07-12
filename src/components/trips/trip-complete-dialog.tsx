"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { completeTrip } from "@/actions/trips";
import {
  completeTripSchema,
  type CompleteTripInput,
  type CompleteTripValues,
} from "@/lib/validations/trip";
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

const EMPTY_VALUES: CompleteTripInput = {
  endOdometer: "",
  fuelLiters: "",
  fuelCost: "",
  revenue: "",
};

export function TripCompleteDialog({
  trigger,
  tripId,
  startOdometer,
}: {
  trigger: React.ReactElement;
  tripId: string;
  startOdometer: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompleteTripInput, unknown, CompleteTripValues>({
    resolver: zodResolver(completeTripSchema),
    defaultValues: EMPTY_VALUES,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(EMPTY_VALUES);
    }
  }

  async function onSubmit(values: CompleteTripValues) {
    setIsSubmitting(true);
    try {
      await completeTrip(tripId, values);
      toast.success("Trip completed");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete trip");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Trip</DialogTitle>
          <DialogDescription>
            {startOdometer !== null
              ? `Start odometer was ${startOdometer.toLocaleString()} km.`
              : "Enter the trip's closing details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="endOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Odometer (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="45230"
                      {...field}
                      value={field.value as number | string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuelLiters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel (liters)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Optional"
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
                name="fuelCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Cost (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Optional"
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="revenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Optional"
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
                {isSubmitting ? "Saving..." : "Complete Trip"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
