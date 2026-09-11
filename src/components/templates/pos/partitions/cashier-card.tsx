"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components";
import { MoreVertical } from "lucide-react";
import { CashierCardProps } from "@/types/cashier";
import { getStatusColor, getStatusDot } from "@/utils";

export const CashierCard: React.FC<CashierCardProps> = ({ cashier, onAdd }) => (
  <Card
    className="mb-4 transition-shadow cursor-pointer hover:shadow-md"
    onClick={() =>
      onAdd({ name: cashier.name, cashNumber: cashier.cashNumber })
    }
  >
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {cashier.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">
              Caixa nº {cashier.cashNumber}
            </h3>
            <p className="text-sm text-gray-600">{cashier.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={getStatusColor(cashier.status)}>
            <div
              className={`w-2 h-2 mr-1 rounded-full ${getStatusDot(
                cashier.status
              )}`}
            ></div>
            {cashier.status}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Total vendido</p>
          <p className="font-semibold">
            {cashier.totalSold.toLocaleString()} Kz
          </p>
        </div>
        <div>
          <p className="text-gray-500">Tempo de atividade</p>
          <p className="font-semibold">{cashier.activityTime}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs text-gray-500">Progresso do Expediente</p>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 transition-all duration-300 bg-green-500 rounded-full"
            style={{ width: `${cashier.progress}%` }}
          ></div>
        </div>
      </div>
    </CardContent>
  </Card>
);
