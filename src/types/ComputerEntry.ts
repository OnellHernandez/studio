import { z } from "zod";
import { Timestamp } from "firebase/firestore"; // Import Timestamp

// Zod schema for validation
export const computerSchema = z.object({
  id: z.string().optional(), // Firestore document ID, optional during creation
  assetTag: z.string().min(1, "Asset Tag is required."),
  computerName: z.string().min(1, "Computer Name is required."),
  processor: z.string().min(1, "Processor is required."),
  ramSize: z.number().min(1, "RAM Size must be at least 1 GB."),
  storageType: z.enum(["SSD", "HDD"]),
  storageSize: z.number().min(1, "Storage Size must be at least 1 GB."),
  tpmVersion: z.string().optional(), // Can be empty, but often useful
  uefiSupport: z.boolean().default(false),
  secureBootEnabled: z.boolean().default(false),
  observations: z.string().optional(),
  userId: z.string(), // ID of the user who added the entry
  createdAt: z.instanceof(Timestamp).optional(), // Let Firestore handle timestamps
  updatedAt: z.instanceof(Timestamp).optional(),
  // Calculated fields (not directly in form, but part of the data)
  isCompatible: z.boolean().default(false),
  verifiedByTool: z.boolean().default(false), // Added field
});

// TypeScript type derived from the schema
export type ComputerEntry = z.infer<typeof computerSchema>;

// Type for Firestore data (handles Timestamps correctly)
export interface ComputerEntryFirestoreData extends Omit<ComputerEntry, 'createdAt' | 'updatedAt' | 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
