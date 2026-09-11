"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Button,
  Avatar,
  AvatarFallback,
  Input,
} from "@/components";
import DatePickerInput from "@/components/custom/date-picker-input";
import PriceInput from "@/components/custom/price-input";
import { CashOpeningFormProps } from "@/types/cashier";
import TimeInput from "@/components/custom/time-input";
import { parseTime } from "@internationalized/date";

export const CashOpeningForm: React.FC<CashOpeningFormProps> = ({
  openCashRegisters,
  onRemove,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    capital: "",
    shiftTime: "",
    openingTime: "",
    openingDate: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("capital", formData.capital);
    formDataObj.append("shiftTime", formData.shiftTime);
    formDataObj.append("openingTime", formData.openingTime);
    formDataObj.append("openingDate", formData.openingDate.toISOString());
    onSubmit(formDataObj);
    setFormData({
      capital: "",
      shiftTime: "",
      openingTime: "",
      openingDate: new Date(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Abertura de Caixa</CardTitle>
        <p className="text-sm text-muted-foreground">
          Abra o caixa e acompanhe o fluxo de vendas dos seus colaboradores.
          Seleccione os cartões dos caixas que pretende adicionar.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capital">Capital Inicial</Label>
            <PriceInput />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expediente">Tempo de Expediente</Label>
            <TimeInput
              id="expediente"
              hourCycle={24}
              value={formData.shiftTime ? parseTime(formData.shiftTime) : undefined}
              onChange={(time: any) =>
                setFormData((prev) => ({
                  ...prev,
                  shiftTime: time ? time.toString().slice(0, 5) : "",
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora">Hora de Abertura</Label>
            <TimeInput
              id="hora"
              hourCycle={24}
              value={formData.openingTime ? parseTime(formData.openingTime) : undefined}
              onChange={(time: any) =>
                setFormData((prev) => ({
                  ...prev,
                  openingTime: time ? time.toString().slice(0, 5) : "",
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data">Data de Abertura</Label>
            <DatePickerInput id="data" />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            Caixas seleccionados ({openCashRegisters.length})
          </h3>
          {openCashRegisters.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              <p>Nenhum caixa seleccionado</p>
              <p className="mt-1 text-xs">
                Seleccione os cartões dos caixas para os adicionar
              </p>
            </div>
          ) : (
            openCashRegisters.map((cashier) => (
              <div
                key={cashier.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {cashier.name
                        .split(" ")
                        .map((value: string) => value[0])
                        .join("")
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-semibold">
                      Caixa nº{cashier.cashNumber}
                    </h3>
                    <p className="text-sm text-primary">{cashier.name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => onRemove(cashier.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={openCashRegisters.length === 0}
            onClick={handleSubmit}
          >
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
