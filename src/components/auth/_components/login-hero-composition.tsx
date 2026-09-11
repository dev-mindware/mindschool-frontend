"use client"

import * as React from "react"
import { HeroBillingChart, HeroStockChart, HeroStatsWidget, HeroPieChart, HeroRadarChart } from "./hero-charts"
import {
    Users,
    ShoppingCart,
    CreditCard,
    Zap
} from "lucide-react"
import { Badge } from "@/components/ui"

export function LoginHeroComposition() {
    return (
        <div className="relative w-full h-full min-h-[700px] flex items-center justify-center overflow-hidden">
            {/* Decorative Background Blobs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96  rounded-full blur-[120px] animate-pulse delay-700" />

            {/* CTA Text - Top Header */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 text-center w-full px-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                <Badge>Gestão inteligente para o seu negócio</Badge>
                <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                    Mindgest <span className="text-primary">ERP</span>
                </h2>
                
            </div>

            {/* Centered Composition */}
            <div className="relative w-full max-w-3xl h-[600px] mt-24">

                {/* Main Billing Chart - Top Left-ish */}
                <div className="absolute top-0 left-10 z-20">
                    <HeroBillingChart />
                </div>

                {/* Radar Chart - Center Right */}
                <div className="absolute top-10 right-4 z-10">
                    <HeroRadarChart />
                </div>

                {/* Pie Chart - Middle Left */}
                <div className="absolute top-[220px] left-0 z-30">
                    <HeroPieChart />
                </div>

                {/* Stock Chart - Bottom Center */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                    <HeroStockChart />
                </div>

                {/* Small Widgets - Overlapping gaps */}

                {/* Top Right Widget */}
                <div className="absolute top-48 right-16 z-30">
                    <HeroStatsWidget
                        icon={Users}
                        label="Novos Clientes"
                        value="1,284"
                        trend="+8%"
                        delay="delay-150"
                    />
                </div>

                {/* Bottom Right Widget */}
                <div className="absolute bottom-20 right-8 z-20">
                    <HeroStatsWidget
                        icon={CreditCard}
                        label="Transacções"
                        value="89"
                        trend="+4%"
                        delay="delay-500"
                    />
                </div>

                {/* Floating Decorative Elements */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" aria-hidden="true">
                    <path
                        d="M 200 250 Q 400 200 600 350"
                        stroke="var(--primary)"
                        strokeWidth="1"
                        fill="none"
                        strokeDasharray="4 4"
                    />
                </svg>

            </div>

            {/* Subtle overlay to soften edges */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950 opacity-60" />
        </div>
    )
}
