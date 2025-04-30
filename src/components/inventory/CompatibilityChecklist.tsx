"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { ComputerEntry } from "@/types/ComputerEntry";

interface CompatibilityChecklistProps {
  values: Partial<ComputerEntry>;
}

const CheckListItem = ({ label, met }: { label: string; met: boolean | 'indeterminate' }) => (
  <li className="flex items-center space-x-2 py-1">
    {met === true && <CheckCircle className="h-5 w-5 text-green-500" />}
    {met === false && <XCircle className="h-5 w-5 text-destructive" />}
    {met === 'indeterminate' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
    <span>{label}</span>
  </li>
);

export function CompatibilityChecklist({ values }: CompatibilityChecklistProps) {
  const { t } = useLanguage();

  const ram = Number(values.ramSize) || 0;
  const storage = Number(values.storageSize) || 0;
  const tpm = parseFloat(values.tpmVersion || "0"); // Assume 0 if not set

  const meetsTPM = tpm >= 2.0;
  const meetsUEFISecureBoot = !!values.uefiSupport && !!values.secureBootEnabled;
  const meetsCPU = !!values.processor; // Basic check, assuming processor field is filled
  const meetsRAM = ram >= 4;
  const meetsStorage = storage >= 64;
  const isVerifiedByTool = !!values.verifiedByTool;

  // Determine overall compatibility status text and icon
  let overallStatusText = t('incompatible');
  let OverallIcon = XCircle;
  let overallColor = "text-destructive";

  if (isVerifiedByTool) {
      overallStatusText = t('compatible'); // Tool verification overrides checklist
      OverallIcon = CheckCircle;
      overallColor = "text-green-500";
  } else if (meetsTPM && meetsUEFISecureBoot && meetsCPU && meetsRAM && meetsStorage) {
     overallStatusText = t('compatible');
     OverallIcon = CheckCircle;
     overallColor = "text-green-500";
  }

  return (
    <Card className="bg-secondary/30 border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          {t("compatibilityChecklist")}
          <span className={`flex items-center text-sm font-semibold ${overallColor}`}>
             <OverallIcon className="mr-1 h-5 w-5" /> {overallStatusText}
           </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          <CheckListItem label={t("tpmRequired")} met={meetsTPM} />
          <CheckListItem label={t("uefiSecureBootRequired")} met={meetsUEFISecureBoot} />
          <CheckListItem label={t("cpuGenerationRequired")} met={meetsCPU ? true : 'indeterminate'} />
          <CheckListItem label={t("ramRequired")} met={meetsRAM} />
          <CheckListItem label={t("storageRequired")} met={meetsStorage} />
          <CheckListItem label={t("compatibilityVerified")} met={isVerifiedByTool} />
        </ul>
      </CardContent>
    </Card>
  );
}
