"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Icon,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from "@/components";
import { cn } from "@/lib/utils";
import { useNotificationSettingsStore } from "@/stores";
import { playSoundEffect, primeAudioPlayback } from "@/utils";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const SOUND_OPTIONS = [
  {
    value: "/sound-effects/notification-1.mp3",
    label: "Clássico",
  },
  {
    value: "/sound-effects/notification-2.mp3",
    label: "Suave",
  },
  {
    value: "/sound-effects/notification-3.mp3",
    label: "Breve",
  },
] as const;

type BrowserPermission = NotificationPermission | "unsupported";

function getBrowserPermission(): BrowserPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return window.Notification.permission;
}

export function Notification() {
  const {
    soundEnabled,
    soundType,
    browserNotificationsEnabled,
    badgeEnabled,
    setSoundEnabled,
    setSoundType,
    setBrowserNotificationsEnabled,
    setBadgeEnabled,
  } = useNotificationSettingsStore();
  const [browserPermission, setBrowserPermission] =
    useState<BrowserPermission>("unsupported");

  useEffect(() => {
    const permission = getBrowserPermission();
    setBrowserPermission(permission);

    if (permission === "granted" && !browserNotificationsEnabled) {
      setBrowserNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    void primeAudioPlayback(soundType);
  }, [soundType]);

  const previewSound = async () => {
    const didPlay = await playSoundEffect(soundType, 0.5);
    if (!didPlay) {
      ErrorMessage("O navegador não permitiu reproduzir o som.");
    }
  };

  const requestBrowserPermission = async () => {
    if (getBrowserPermission() === "unsupported") return;

    const permission = await window.Notification.requestPermission();
    setBrowserPermission(permission);

    if (permission === "granted") {
      setBrowserNotificationsEnabled(true);
      SucessMessage("Notificações do navegador activadas.");
      return;
    }

    setBrowserNotificationsEnabled(false);
    if (permission === "denied") {
      ErrorMessage(
        "A permissão foi bloqueada. Pode alterá-la nas definições do navegador.",
      );
    }
  };

  const handleBrowserNotificationsChange = (enabled: boolean) => {
    if (!enabled) {
      setBrowserNotificationsEnabled(false);
      return;
    }

    if (browserPermission === "granted") {
      setBrowserNotificationsEnabled(true);
      return;
    }

    void requestBrowserPermission();
  };

  const browserNotificationsAvailable = browserPermission !== "unsupported";
  const browserNotificationsBlocked = browserPermission === "denied";

  return (
    <section className="space-y-6" data-tour="setup-notifications-content">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Notificações</h2>
        <p className="text-sm text-muted-foreground">
          Configure os alertas deste navegador e a forma como são apresentados.
        </p>
      </div>

      <Separator />

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <SettingRow
          icon="Volume2"
          label="Som das notificações"
          description="Reproduzir um aviso sonoro quando chegar uma nova notificação."
          control={
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              aria-label="Reproduzir som das notificações"
            />
          }
        />

        <Separator className="my-5" />

        <SettingRow
          icon="AudioLines"
          label="Som do alerta"
          description="Escolha e teste o som usado neste dispositivo."
          disabled={!soundEnabled}
          control={
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Select
                value={soundType}
                onValueChange={setSoundType}
                disabled={!soundEnabled}
              >
                <SelectTrigger className="w-full sm:w-40" aria-label="Som do alerta">
                  <SelectValue placeholder="Seleccionar som" />
                </SelectTrigger>
                <SelectContent>
                  {SOUND_OPTIONS.map((sound) => (
                    <SelectItem key={sound.value} value={sound.value}>
                      {sound.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={!soundEnabled}
                onClick={previewSound}
                aria-label="Ouvir som seleccionado"
                title="Ouvir som"
              >
                <Icon name="Play" className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        <Separator className="my-5" />

        <SettingRow
          icon="CircleDot"
          label="Indicador de não lidas"
          description="Mostrar no sino a quantidade de notificações ainda não consultadas."
          control={
            <Switch
              checked={badgeEnabled}
              onCheckedChange={setBadgeEnabled}
              aria-label="Mostrar indicador de notificações não lidas"
            />
          }
        />

        <Separator className="my-5" />

        <SettingRow
          icon="MonitorUp"
          label="Notificações do navegador"
          description="Apresentar um aviso do sistema sempre que chegar uma nova notificação."
          disabled={!browserNotificationsAvailable || browserNotificationsBlocked}
          control={
            <Switch
              checked={
                browserNotificationsEnabled && browserPermission === "granted"
              }
              onCheckedChange={handleBrowserNotificationsChange}
              disabled={!browserNotificationsAvailable || browserNotificationsBlocked}
              aria-label="Activar notificações do navegador"
            />
          }
        />
      </div>

      {!browserNotificationsAvailable && (
        <Alert>
          <Icon name="Info" />
          <AlertTitle>Recurso indisponível</AlertTitle>
          <AlertDescription>
            Este navegador não suporta notificações do sistema.
          </AlertDescription>
        </Alert>
      )}

      {browserNotificationsBlocked && (
        <Alert variant="destructive">
          <Icon name="BellOff" />
          <AlertTitle>Permissão bloqueada</AlertTitle>
          <AlertDescription>
            Autorize as notificações nas definições do navegador e volte a abrir esta página.
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}

function SettingRow({
  icon,
  label,
  description,
  control,
  disabled,
}: {
  icon: "Volume2" | "AudioLines" | "CircleDot" | "MonitorUp";
  label: string;
  description: string;
  control: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        disabled && "opacity-60",
      )}
    >
      <div className="flex max-w-xl items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon name={icon} className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-semibold">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
