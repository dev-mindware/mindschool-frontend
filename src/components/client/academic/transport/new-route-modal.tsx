"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Button, FormModal, Icon, Input } from "@/components";
import { useTransport } from "@/hooks/school/use-transport";
import { getApiErrorMessage } from "@/utils/api-error";

import { formatPhone } from "@/utils/format-phone";

const EMPTY_STOPS = [{ name: "", time: "" }, { name: "", time: "" }];

export function NewRouteModal() {
  const { createRoute } = useTransport();
  const [f, setF] = useState({ name: "", plate: "", driver: "", phone: "", capacity: 30 });
  const [stops, setStops] = useState(EMPTY_STOPS);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = () =>
    createRoute
      .mutateAsync({ name: f.name.trim(), vehiclePlate: f.plate.trim() || undefined, driverName: f.driver.trim() || undefined, driverPhone: f.phone.trim() || undefined, capacity: f.capacity, stops: stops.filter((s) => s.name.trim().length >= 2).map((s) => ({ name: s.name.trim(), pickupTime: s.time || undefined })) })
      .then(() => { SucessMessage("Rota criada."); setF({ name: "", plate: "", driver: "", phone: "", capacity: 30 }); setStops(EMPTY_STOPS); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível criar a rota.")); throw err; });

  return (
    <FormModal id="transport-new-route" title="Nova rota" description="Defina a viatura, o motorista e as paragens por ordem." size="lg" submitLabel="Criar rota" isLoading={createRoute.isPending} disabled={f.name.trim().length < 2} onSubmit={submit}>
      <div className="sm:col-span-2"><Input label="Nome da rota *" startIcon="Route" placeholder="Ex: Rota Norte (Cacuaco)" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <Input label="Matrícula da viatura" startIcon="Bus" placeholder="LD-12-34-AB" value={f.plate} onChange={(e) => set("plate", e.target.value)} />
      <Input label="Lotação *" type="quantity" min={1} max={120} step={1} value={f.capacity} onChange={(e) => set("capacity", Math.max(1, Math.min(120, Number(e.target.value) || 1)))} />
      <Input label="Motorista" startIcon="User" value={f.driver} onChange={(e) => set("driver", e.target.value)} />
      <Input label="Telefone" startIcon="Phone" placeholder="Ex: 923 000 000" value={f.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} />
      <div className="sm:col-span-2 space-y-2">
        <p className="text-sm font-medium">Paragens (por ordem)</p>
        {stops.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_130px] gap-2">
            <Input label="" placeholder={`Paragem ${i + 1}`} value={s.name} onChange={(e) => setStops((cur) => cur.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <Input label="" type="time" value={s.time} onChange={(e) => setStops((cur) => cur.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} />
          </div>
        ))}
        <Button type="button" size="sm" variant="ghost" className="gap-1" onClick={() => setStops((cur) => [...cur, { name: "", time: "" }])}><Icon name="Plus" className="size-3.5" />Mais uma paragem</Button>
      </div>
    </FormModal>
  );
}
