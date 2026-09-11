"use client";

import { Icon, Switch } from "@/components";
import { useWorkspaceStore } from "@/stores/pos/workspace-store";

export function PosWorkspaceSettings() {
    const {
        disableVirtualKeyboard,
        useThermalPrinter,
        setDisableVirtualKeyboard,
        setUseThermalPrinter,
    } = useWorkspaceStore();

    return (
        <div className="space-y-6 pb-12" data-tour="pos-settings-workspace">
            <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] px-1">Interface & Dispositivos</p>
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/30 shadow-sm">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all" data-tour="pos-settings-virtual-keyboard">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                <Icon name="Keyboard" size={16} className="text-primary-500" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Teclado Virtual</p>
                                <p className="text-[11px] text-muted-foreground">Ocultar quando usar teclado físico</p>
                            </div>
                        </div>
                        <Switch
                            checked={disableVirtualKeyboard}
                            onCheckedChange={setDisableVirtualKeyboard}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all" data-tour="pos-settings-printer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                <Icon name="Printer" size={16} className="text-primary-500" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Impressora térmica</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Imprimir vendas no formato de talão
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={useThermalPrinter}
                            onCheckedChange={setUseThermalPrinter}
                            aria-label="Usar impressora térmica"
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>

                    {/* Placeholder for more settings like Scanner, Scale, etc to show the pattern */}
                    <div className="flex items-center justify-between p-4 opacity-50 cursor-not-allowed" data-tour="pos-settings-external-scanner">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                                <Icon name="QrCode" size={16} className="text-destructive" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Scanner Externo</p>
                                <p className="text-[11px] text-muted-foreground">Configurar leitores USB/Bluetooth</p>
                            </div>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    </div>
                </div>
                <p className="px-1 text-[11px] text-muted-foreground leading-relaxed mt-2 italic">
                    Estas configurações aplicam-se apenas a este navegador e a esta estação de trabalho.
                </p>
            </div>
        </div>
    );
}
