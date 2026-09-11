import React from "react";
import { Icon } from "@/components";
import { TabsContent } from "@/components/ui/tabs";
import { LocalChatSession } from "./index";

export const formatTimeAgo = (dateString: string) => {
    const diffMs = new Date().getTime() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return "Agora";
};

interface HistoryTabProps {
    sessions: LocalChatSession[];
    openSession: (session: LocalChatSession) => void;
}

export function HistoryTab({ sessions, openSession }: HistoryTabProps) {
    return (
        <TabsContent value="history" className="flex-1 overflow-y-auto px-6 py-4 m-0 outline-none data-[state=inactive]:hidden">
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                    <Icon name="MessageSquare" className="h-4 w-4" />
                    Conversas Recentes
                </h3>

                {sessions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {sessions.map((session) => {
                            const lastAssistantMessage = session.messages.slice().reverse().find(m => m.role === "assistant")?.content
                                || session.messages[0]?.content
                                || "Nova conversa";

                            return (
                                <button
                                    key={session.id}
                                    onClick={() => openSession(session)}
                                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group border border-transparent hover:border-border/60"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                        <Icon name="Sparkles" className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col pt-1">
                                        <div className="flex justify-between items-center gap-2">
                                            <p className="text-sm text-foreground font-medium truncate">
                                                MIND: {lastAssistantMessage.replace(/\*\*/g, '').slice(0, 40)}...
                                            </p>
                                            <span className="flex-shrink-0 text-xs text-muted-foreground font-medium">
                                                {formatTimeAgo(session.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium group-hover:text-foreground/80 transition-colors">
                                            Fechado
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-border/60 rounded-xl mt-4">
                        <Icon name="MessageSquare" className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">Nenhuma conversa encontrada</p>
                        <p className="text-xs text-muted-foreground/60 max-w-[200px]">As suas conversas dos últimos 7 dias aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </TabsContent>
    );
}
