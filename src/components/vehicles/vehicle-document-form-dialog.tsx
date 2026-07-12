"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createVehicleDocument } from "@/actions/vehicle-documents";
import {
  vehicleDocumentFormSchema,
  type VehicleDocumentFormInput,
  type VehicleDocumentFormValues,
} from "@/lib/validations/vehicle-document";
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

const EMPTY_VALUES: VehicleDocumentFormInput = {
  name: "",
  url: "",
  expiryDate: "",
};

export function VehicleDocumentFormDialog({
  trigger,
  vehicleId,
}: {
  trigger: React.ReactElement;
  vehicleId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleDocumentFormInput, unknown, VehicleDocumentFormValues>({
    resolver: zodResolver(vehicleDocumentFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(EMPTY_VALUES);
    }
  }

  async function onSubmit(values: VehicleDocumentFormValues) {
    setIsSubmitting(true);
    try {
      await createVehicleDocument(vehicleId, values);
      toast.success("Document added");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add document");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>Link an existing document — no file upload storage is set up.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document name</FormLabel>
                  <FormControl>
                    <Input placeholder="Insurance policy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Document"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
