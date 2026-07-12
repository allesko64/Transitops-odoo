"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createDriver, updateDriver } from "@/actions/drivers";
import {
  driverFormSchema,
  type DriverFormInput,
  type DriverFormValues,
} from "@/lib/validations/driver";
import type { Driver } from "@/db/schema";
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

function defaultValuesFor(driver?: Driver): DriverFormInput {
  return {
    name: driver?.name ?? "",
    licenseNumber: driver?.licenseNumber ?? "",
    licenseCategory: driver?.licenseCategory ?? "",
    licenseExpiry: driver?.licenseExpiry ?? "",
    safetyScore: driver ? driver.safetyScore : "",
  };
}

export function DriverFormDialog({
  trigger,
  driver,
}: {
  trigger: React.ReactElement;
  driver?: Driver;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!driver;

  const form = useForm<DriverFormInput, unknown, DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: defaultValuesFor(driver),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(defaultValuesFor(driver));
    }
  }

  async function onSubmit(values: DriverFormValues) {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateDriver(driver.id, values);
        toast.success("Driver updated");
      } else {
        await createDriver(values);
        toast.success("Driver created");
      }
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      if (message.toLowerCase().includes("license number")) {
        form.setError("licenseNumber", { message });
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
          <DialogTitle>{isEdit ? "Edit Driver" : "Add Driver"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this driver's details."
              : "Add a new driver to the fleet."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="DL-0420110012345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="HMV" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Expiry</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="safetyScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Safety Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
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
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add driver"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
