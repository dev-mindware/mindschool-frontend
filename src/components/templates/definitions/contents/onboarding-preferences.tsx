"use client";

import { Button, Icon, Separator, Switch } from "@/components";
import { onboardingTours, type OnboardingTourId } from "@/constants/onboarding-tours";
import { useAuth } from "@/hooks/auth";
import { useOnboardingPreferencesStore } from "@/stores";
import { useOnboardingPreferencesPersistence } from "@/hooks/onboarding/use-onboarding-preferences";

function getOnboardingScope(userId?: string, companyId?: string) {
  return [companyId || "company", userId || "user"].join(":");
}

export function OnboardingPreferences() {
  const { user } = useAuth();
  const scope = getOnboardingScope(user?.id, user?.company?.id);
  const persistence = useOnboardingPreferencesPersistence(
    scope,
    Boolean(user?.id && user?.company?.id),
  );
  const scopedPreferences = useOnboardingPreferencesStore(
    (state) => state.preferencesByScope[scope],
  );
  const preferences = {
    autoStartEnabled: scopedPreferences?.autoStartEnabled ?? true,
    tourButtonEnabled: scopedPreferences?.tourButtonEnabled ?? true,
    seenTours: scopedPreferences?.seenTours ?? {},
  };
  const setAutoStartEnabled = useOnboardingPreferencesStore(
    (state) => state.setAutoStartEnabled,
  );
  const setTourButtonEnabled = useOnboardingPreferencesStore(
    (state) => state.setTourButtonEnabled,
  );
  const seenCount = Object.keys(preferences.seenTours).length;
  const totalTours = Object.keys(onboardingTours).length;
  const seenTourEntries = Object.entries(preferences.seenTours)
    .map(([tourId, status]) => {
      const id = tourId as OnboardingTourId;
      const tour = onboardingTours[id];
      if (!tour) return null;

      return {
        id,
        status,
        title: tour.title,
        priority: tour.priority,
        group: tour.group,
      };
    })
    .filter((tour): tour is NonNullable<typeof tour> => Boolean(tour))
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  return (
    <section className="space-y-6" data-tour="setup-guides-content">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Guias orientados</h2>
        <p className="text-sm text-muted-foreground">
          Defina quando os guias devem aparecer e repita-os sempre que necessário.
        </p>
      </div>

      <Separator />

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <Icon name="Route" className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Mostrar guias automaticamente</h3>
                <p className="text-sm text-muted-foreground">
                  Quando estiver ativo, cada guia aparece uma vez por utilizador e fluxo.
                </p>
              </div>
            </div>
          </div>

          <Switch
            checked={preferences.autoStartEnabled}
            onCheckedChange={(checked) => {
              setAutoStartEnabled(scope, checked);
              persistence.persistPreferences({ autoStartEnabled: checked });
            }}
            aria-label="Mostrar guias automaticamente"
          />
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <Icon name="CircleHelp" className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Mostrar botão “Ver guia”</h3>
                <p className="text-sm text-muted-foreground">
                  Quando estiver desactivado, o botão manual deixa de aparecer nas páginas com guia.
                </p>
              </div>
            </div>
          </div>

          <Switch
            checked={preferences.tourButtonEnabled}
            onCheckedChange={(checked) => {
              setTourButtonEnabled(scope, checked);
              persistence.persistPreferences({ tourButtonEnabled: checked });
            }}
            aria-label="Mostrar botão Ver guia"
          />
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              {seenCount} de {totalTours} guias já vistos ou ignorados
            </p>
            <p className="text-sm text-muted-foreground">
              A abertura automática e o botão manual podem ser controlados separadamente.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() => {
              persistence.persistResetAllTours();
            }}
          >
            <Icon name="RotateCcw" className="h-4 w-4" />
            Repor guias
          </Button>
        </div>

        {seenTourEntries.length > 0 && (
          <>
            <Separator className="my-5" />

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Guias concluídos</h3>
                <p className="text-sm text-muted-foreground">
                  Reponha apenas o guia que quer ver novamente.
                </p>
              </div>

              <div className="divide-y rounded-md border">
                {seenTourEntries.map((tour) => (
                  <div
                    key={tour.id}
                    className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{tour.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {tour.status === "completed" ? "Concluído" : "Ignorado"} · {tour.group}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 sm:w-auto"
                      onClick={() => {
                        persistence.persistResetTour(tour.id);
                      }}
                    >
                      <Icon name="RotateCcw" className="h-3.5 w-3.5" />
                      Repor
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
