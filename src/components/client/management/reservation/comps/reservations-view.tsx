"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import { useGetReservations } from "@/hooks/stock-reservations/use-get-reservations";
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Tabs, TabsList, TabsTrigger, Button } from "@/components";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { ReservationDetailModal } from "./reservation-detail-modal";
import { StockReservationResponse } from "@/types/stock";
import { useModal } from "@/stores";

export function ReservationsView() {
    const calendarRef = useRef<FullCalendar>(null);
    const { data: reservations, isLoading } = useGetReservations();
    const [selectedReservation, setSelectedReservation] = useState<StockReservationResponse | null>(null);
    const { openModal } = useModal();
    const [view, setView] = useState("dayGridMonth");

    const events = reservations?.map((res) => {
        let color = "#9956f6";
        switch (res.status) {
            case "SCHEDULED": color = "#f59e0b"; break;
            case "ACTIVE": color = "#9956f6"; break;
            case "COMPLETED": color = "#10b981"; break;
            case "CANCELLED": color = "#ea4335"; break;
        }

        const stripTz = (d: string) => d.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");

        return {
            id: res.id,
            title: `${res.item?.name} (${res.quantity})`,
            start: stripTz(res.startDate),
            end: stripTz(res.endDate),
            backgroundColor: color,
            borderColor: color,
            extendedProps: { ...res },
        };
    });

    const handleEventClick = (info: any) => {
        setSelectedReservation(info.event.extendedProps as StockReservationResponse);
        openModal("reservation-detail");
    };

    const handlePrev = () => calendarRef.current?.getApi().prev();
    const handleNext = () => calendarRef.current?.getApi().next();
    const handleToday = () => calendarRef.current?.getApi().today();
    const handleViewChange = (val: string) => {
        const viewType = val === "month" ? "dayGridMonth" : "timeGridWeek";
        setView(viewType);
        calendarRef.current?.getApi().changeView(viewType);
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[600px] w-full" />
                </CardContent>
            </Card>
        );
    }

    

    return (
        <Card className="w-full shadow-md border-muted">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b mb-6">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-bold">Calendário de Reservas</CardTitle>
                </div>

                <div className="flex flex-wrap items-center gap-3" data-tour="reservations-controls">
                    {/* Navigation */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border">
                        <Button data-tour="reservations-prev" variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button data-tour="reservations-today" variant="ghost" size="sm" className="h-8 px-3 text-xs font-semibold" onClick={handleToday}>
                            Hoje
                        </Button>
                        <Button data-tour="reservations-next" variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* View Switcher */}
                    <Tabs value={view === "dayGridMonth" ? "month" : "week"} onValueChange={handleViewChange}>
                        <TabsList className="bg-muted/50 border">
                            <TabsTrigger data-tour="reservations-view-month" value="month" className="text-xs px-4 h-8">Mês</TabsTrigger>
                            <TabsTrigger data-tour="reservations-view-week" value="week" className="text-xs px-4 h-8">Semana</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent data-tour={events?.length ? "reservations-events" : "reservations-empty-state"}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locales={[ptLocale]}
                    locale="pt"
                    events={events}
                    eventClick={handleEventClick}
                    headerToolbar={false}
                    height="700px"
                    nowIndicator={true}
                    editable={false}
                    selectable={false}
                    selectMirror={true}
                    dayMaxEvents={3}
                    moreLinkClick="popover"
                    initialDate={new Date()}
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00"
                    allDaySlot={false}
                />
            </CardContent>

            <ReservationDetailModal reservation={selectedReservation} />
        </Card>
    );
}
