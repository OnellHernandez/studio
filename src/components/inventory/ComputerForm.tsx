"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/LanguageContext";
import { ComputerEntry, computerSchema } from "@/types/ComputerEntry";
import { CompatibilityChecklist } from "./CompatibilityChecklist";
import React, { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface ComputerFormProps {
  onSubmit: (data: ComputerEntry) => Promise<void>;
  initialData?: Partial<ComputerEntry>;
  isLoading?: boolean;
  onCancel?: () => void;
}

// Function to calculate compatibility based on form values
// Moved outside the component as it doesn't depend on component state/props
const calculateCompatibility = (values: Partial<ComputerEntry>): boolean => {
    const ram = Number(values.ramSize) || 0;
    const storage = Number(values.storageSize) || 0;
    const tpm = parseFloat(values.tpmVersion || "0"); // Assume 0 if not set

    const meetsTPM = tpm >= 2.0;
    const meetsUEFISecureBoot = !!values.uefiSupport && !!values.secureBootEnabled;
    // Basic CPU check (can be refined with specific lists if needed)
    // Assuming any modern-ish CPU might be okay for prototype, but requires TPM/UEFI
    const meetsCPU = !!values.processor;
    const meetsRAM = ram >= 4;
    const meetsStorage = storage >= 64;

    // Compatibility verified via tool takes precedence if checked
    if(values.verifiedByTool) return true;

    return meetsTPM && meetsUEFISecureBoot && meetsCPU && meetsRAM && meetsStorage;
};


export function ComputerForm({ onSubmit, initialData = {}, isLoading = false, onCancel }: ComputerFormProps) {
  const { t } = useLanguage();
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const form = useForm<ComputerEntry>({
    resolver: zodResolver(computerSchema),
    defaultValues: {
      assetTag: initialData.assetTag ?? "",
      computerName: initialData.computerName ?? "",
      processor: initialData.processor ?? "",
      ramSize: initialData.ramSize ?? 4, // Default to minimum
      storageType: initialData.storageType ?? "HDD",
      storageSize: initialData.storageSize ?? 64, // Default to minimum
      tpmVersion: initialData.tpmVersion ?? "",
      uefiSupport: initialData.uefiSupport ?? false,
      secureBootEnabled: initialData.secureBootEnabled ?? false,
      // windows11Compatible: calculated later
      observations: initialData.observations ?? "",
      // Internal fields
      userId: initialData.userId ?? "", // Should be set on submit
      createdAt: initialData.createdAt ?? undefined,
      updatedAt: initialData.updatedAt ?? undefined,
      isCompatible: initialData.id ? calculateCompatibility(initialData) : false, // Calculate on init if editing
      verifiedByTool: initialData.verifiedByTool ?? false, // Add this field
    },
  });


  // Watch form values to update compatibility checklist and calculated field
  const watchedValues = form.watch();

  // Memoize watched values relevant to compatibility to prevent unnecessary effect runs
  const compatibilityDeps = [
      watchedValues.processor,
      watchedValues.ramSize,
      watchedValues.storageSize,
      watchedValues.tpmVersion,
      watchedValues.uefiSupport,
      watchedValues.secureBootEnabled,
      watchedValues.verifiedByTool,
  ];

  useEffect(() => {
    const newCompatibility = calculateCompatibility(watchedValues);
    const currentCompatibility = form.getValues("isCompatible");

    // Only update the form value if the calculated compatibility has actually changed
    if (newCompatibility !== currentCompatibility) {
        form.setValue("isCompatible", newCompatibility, { shouldValidate: false, shouldDirty: true }); // Update calculated field
    }
    // Use the memoized dependencies array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, ...compatibilityDeps]);


  const handleFormSubmit = async (values: ComputerEntry) => {
    setIsSubmitting(true);
    await onSubmit(values);
    // Only set submitting false if onSubmit doesn't cause a redirect/unmount
    // In this app, onSubmit usually redirects, so setting this might not be necessary
    // or could cause a brief flicker if the redirect is slightly delayed.
    // However, if an error occurs in onSubmit, we need to reset the state.
    // This is handled in the calling components (Add/Edit pages).
    // setIsSubmitting(false); // Potentially remove this line if Add/Edit handle it fully
  };

  const isFormLoading = isLoading || isSubmitting;


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="assetTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assetTag")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., COMP00123" {...field} disabled={isFormLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="computerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("computerName")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., DESKTOP-ABC1" {...field} disabled={isFormLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="processor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("processor")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Intel i5-8250U" {...field} disabled={isFormLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ramSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ramSize")}</FormLabel>
                  <FormControl>
                    <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 8"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                        disabled={isFormLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="storageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("storageType")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SSD">{t('storageTypeSSD')}</SelectItem>
                          <SelectItem value="HDD">{t('storageTypeHDD')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="storageSize"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("storageSize")}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min="1"
                                placeholder="e.g., 256"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                                disabled={isFormLoading}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="tpmVersion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tpmVersion")}</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., 2.0 or 1.2" {...field} disabled={isFormLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
               control={form.control}
               name="uefiSupport"
               render={({ field }) => (
                 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isFormLoading}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>{t("uefiSupport")}</FormLabel>
                    </div>
                 </FormItem>
               )}
             />

            <FormField
              control={form.control}
              name="secureBootEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            // Disable if UEFI is not supported OR if the form is currently loading/submitting
                            disabled={!watchedValues.uefiSupport || isFormLoading}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>{t("secureBootEnabled")}</FormLabel>
                         {!watchedValues.uefiSupport && (
                            <p className="text-xs text-muted-foreground">Requires UEFI Support</p>
                         )}
                    </div>
                 </FormItem>
              )}
            />

             <FormField
                 control={form.control}
                 name="verifiedByTool"
                 render={({ field }) => (
                   <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-secondary/50">
                      <FormControl>
                          <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isFormLoading}
                          />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                          <FormLabel>{t("compatibilityVerified")}</FormLabel>
                           <p className="text-xs text-muted-foreground">Overrides checklist if checked</p>
                      </div>
                   </FormItem>
                 )}
             />


            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("observations")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any relevant notes..." {...field} disabled={isFormLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Compatibility Checklist - Read Only - Pass watched values directly */}
        <CompatibilityChecklist values={watchedValues} />

        <div className="flex justify-end space-x-4">
           {onCancel && (
             <Button type="button" variant="outline" onClick={onCancel} disabled={isFormLoading}>
               {t("cancel")}
             </Button>
           )}
           <Button type="submit" disabled={isFormLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData?.id ? t("save") : t("addComputer")} {/* Change button text based on mode */}
           </Button>
        </div>
      </form>
    </Form>
  );
}
