"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Icon } from "@/components";
import { calendarService } from "@/services/calendar-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "ainda não");

/**
 * Cartão do professor: publica o seu horário num calendário «MindEscola — Horário» criado na sua conta Google (opt-in,
 * revogável a qualquer momento). Só aparece a quem é professor e se a escola tem a integração disponível.
 */
export function TeacherGoogleCard() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const isTeacher = useActiveSchoolStore((s) => Boolean(s.memberships.find((m) => m.schoolId === s.schoolId)?.roles.includes("professor")));
  const queryClient = useQueryClient();
  const key = ["teacher-google", schoolId];
  const status = useQuery({ queryKey: key, queryFn: calendarService.teacherGoogleStatus, enabled: Boolean(schoolId) && isTeacher, retry: false, staleTime: 60_000 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });
  const fail = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));

  const connect = useMutation({ mutationFn: calendarService.teacherGoogleConnect, onSuccess: (url) => { window.location.href = url; }, onError: fail });
  const sync = useMutation({ mutationFn: calendarService.teacherGoogleSync, onSuccess: () => { SucessMessage("Horário sincronizado com o Google Calendar."); void refresh(); }, onError: fail });
  const disconnect = useMutation({ mutationFn: calendarService.teacherGoogleDisconnect, onSuccess: () => { SucessMessage("Google Calendar desligado."); void refresh(); }, onError: fail });

  // Sem ficha de professor, sem permissão ou sem a integração no plano da escola: não há nada a mostrar.
  if (!isTeacher || status.isLoading || status.isError || !status.data) return null;
  const { connected, link } = status.data;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="CalendarSync" className="size-4 text-primary" />O meu horário no Google Calendar
        </CardTitle>
        <Badge variant={connected ? "success" : "secondary"}>{connected ? "Ligado" : "Desligado"}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {connected ? (
          <>
            <p className="text-muted-foreground">
              O seu horário está publicado no calendário «MindEscola — Horário» da sua conta Google. Última sincronização: {when(link?.last_sync_at ?? null)}.
            </p>
            {link?.last_error && <p className="text-xs text-destructive">Último erro: {link.last_error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" disabled={sync.isPending} onClick={() => sync.mutate()}>
                <Icon name="RefreshCcw" className="size-4" />Sincronizar agora
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" disabled={disconnect.isPending} onClick={() => disconnect.mutate()}>Desligar</Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              Receba as suas aulas no Google Calendar. É criado um calendário próprio na sua conta; a escola só publica lá o seu horário (nunca
              acede aos seus outros calendários) e pode desligar quando quiser.
            </p>
            <Button size="sm" className="gap-1.5" disabled={connect.isPending} onClick={() => connect.mutate()}>
              <Icon name="Link" className="size-4" />Ligar ao Google Calendar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
