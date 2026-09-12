"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useHealthStore } from "@/stores/school/health-store";
import { StudentHealthProfile, BloodType } from "@/types";
import { toast } from "sonner";

interface HealthProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: StudentHealthProfile | null;
  onPrintReport?: (profile: StudentHealthProfile) => void;
}

export function HealthProfileModal({
  open,
  onOpenChange,
  profile,
  onPrintReport,
}: HealthProfileModalProps) {
  const { saveHealthProfile } = useHealthStore();

  const [bloodType, setBloodType] = useState<BloodType>("UNKNOWN");
  const [allergiesInput, setAllergiesInput] = useState("");
  const [chronicConditionsInput, setChronicConditionsInput] = useState("");
  const [medicationsInput, setMedicationsInput] = useState("");
  const [restrictionsInput, setRestrictionsInput] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRel, setEmergencyRel] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [vaccinationUpToDate, setVaccinationUpToDate] = useState(true);
  const [confidentialNotes, setConfidentialNotes] = useState("");

  useEffect(() => {
    if (profile) {
      setBloodType(profile.bloodType || "UNKNOWN");
      setAllergiesInput(profile.allergies ? profile.allergies.join(", ") : "");
      setChronicConditionsInput(profile.chronicConditions ? profile.chronicConditions.join(", ") : "");
      setMedicationsInput(profile.regularMedications ? profile.regularMedications.join(", ") : "");
      setRestrictionsInput(profile.physicalRestrictions ? profile.physicalRestrictions.join(", ") : "");
      setEmergencyName(profile.emergencyContactName || "");
      setEmergencyPhone(profile.emergencyContactPhone || "");
      setEmergencyRel(profile.emergencyContactRelationship || "");
      setInsuranceProvider(profile.healthInsuranceProvider || "");
      setInsuranceNumber(profile.healthInsuranceNumber || "");
      setVaccinationUpToDate(profile.vaccinationUpToDate ?? true);
      setConfidentialNotes(profile.confidentialNotes || "");
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const parseList = (str: string) =>
      str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const updatedProfile: StudentHealthProfile = {
      ...profile,
      bloodType,
      allergies: parseList(allergiesInput),
      chronicConditions: parseList(chronicConditionsInput),
      regularMedications: parseList(medicationsInput),
      physicalRestrictions: parseList(restrictionsInput),
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      emergencyContactRelationship: emergencyRel,
      healthInsuranceProvider: insuranceProvider || undefined,
      healthInsuranceNumber: insuranceNumber || undefined,
      vaccinationUpToDate,
      confidentialNotes: confidentialNotes || undefined,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    saveHealthProfile(updatedProfile);
    toast.success("Ficha médica actualizada com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Icon name="Activity" className="size-5 text-primary" />
              Ficha Clínica Escolar — {profile.studentName}
            </DialogTitle>
            {onPrintReport && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => onPrintReport(profile)}
              >
                <Icon name="Printer" className="size-3.5" />
                Imprimir Ficha A4
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {profile.studentNumber} | {profile.classLevel} — {profile.sectionName}
          </p>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Informações Básicas & Grupo Sanguíneo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Grupo Sanguíneo</label>
              <Select
                value={bloodType}
                onValueChange={(val) => setBloodType(val as BloodType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="O+">O Positivo (O+)</SelectItem>
                  <SelectItem value="O-">O Negativo (O-)</SelectItem>
                  <SelectItem value="A+">A Positivo (A+)</SelectItem>
                  <SelectItem value="A-">A Negativo (A-)</SelectItem>
                  <SelectItem value="B+">B Positivo (B+)</SelectItem>
                  <SelectItem value="B-">B Negativo (B-)</SelectItem>
                  <SelectItem value="AB+">AB Positivo (AB+)</SelectItem>
                  <SelectItem value="AB-">AB Negativo (AB-)</SelectItem>
                  <SelectItem value="UNKNOWN">Não especificado / A apurar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-medium text-foreground">Alergias (separadas por vírgula)</label>
              <input
                type="text"
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                placeholder="Ex: Penicilina, Amendoim, Mariscos, Picada de abelha"
                className="w-full px-3 py-2 border rounded-md bg-background text-xs"
              />
            </div>
          </div>

          {/* Doenças Crónicas & Medicamentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Condições Crónicas Conhecidas</label>
              <input
                type="text"
                value={chronicConditionsInput}
                onChange={(e) => setChronicConditionsInput(e.target.value)}
                placeholder="Ex: Asma, Diabetes Tipo 1, Epilepsia"
                className="w-full px-3 py-2 border rounded-md bg-background text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Medicação de Uso Habitual / SOS</label>
              <input
                type="text"
                value={medicationsInput}
                onChange={(e) => setMedicationsInput(e.target.value)}
                placeholder="Ex: Salbutamol 100mcg spray, Insulina"
                className="w-full px-3 py-2 border rounded-md bg-background text-xs"
              />
            </div>
          </div>

          {/* Restrições Físicas / Ed. Física */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Restrições na Aula de Educação Física / Desporto</label>
            <input
              type="text"
              value={restrictionsInput}
              onChange={(e) => setRestrictionsInput(e.target.value)}
              placeholder="Ex: Isenção de esforço aeróbico intenso sob recomendação médica"
              className="w-full px-3 py-2 border rounded-md bg-background text-xs"
            />
          </div>

          {/* Contacto de Emergência */}
          <div className="border rounded-md p-3 bg-muted/20 space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Icon name="PhoneCall" className="size-4 text-emerald-600" />
              Contacto Prioritário de Emergência
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground">Nome do Contacto</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Ex: Maria António"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Telefone de Emergência</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+244 923 000 000"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Grau de Parentesco</label>
                <input
                  type="text"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  placeholder="Ex: Mãe / Pai / Tutor"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                />
              </div>
            </div>
          </div>

          {/* Seguro de Saúde & Vacinação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-foreground">Seguradora de Saúde</label>
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="Ex: ENSA, Nossa Seguros"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">Nº da Apólice / Cartão</label>
              <input
                type="text"
                value={insuranceNumber}
                onChange={(e) => setInsuranceNumber(e.target.value)}
                placeholder="Ex: ENSA-123456"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={vaccinationUpToDate}
                  onChange={(e) => setVaccinationUpToDate(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                Plano de Vacinação Actualizado
              </label>
            </div>
          </div>

          {/* Notas Confidenciais */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <Icon name="Lock" className="size-3.5 text-muted-foreground" />
              Observações Médicas Confidenciais (Acesso Restrito à Direcção & Enfermaria)
            </label>
            <textarea
              rows={2}
              value={confidentialNotes}
              onChange={(e) => setConfidentialNotes(e.target.value)}
              placeholder="Instruções particulares e histórico de saúde relevante..."
              className="w-full px-3 py-2 border rounded-md bg-background text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Icon name="Check" className="size-4" />
              Guardar Ficha Médica
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
