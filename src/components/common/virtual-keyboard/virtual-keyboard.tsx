"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { useKeyboard } from "@/contexts/keyboard-context";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function VirtualKeyboard() {
    const {
        isVisible,
        layout,
        isShift,
        isCaps,
        toggleShift,
        toggleCaps,
        handleKeyPress,
        closeKeyboard,
        setLayout,
    } = useKeyboard();

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [mounted, setMounted] = useState(false);

    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
    const keyboardRef = useRef<Keyboard | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mainContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize simple-keyboard
    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        keyboardRef.current = new Keyboard(containerRef.current, {
            onChange: (input: string) => { },
            layoutName: layout,
            onKeyPress: (button: string) => {
                let key = button;
                if (button === "{bksp}" || button === "{backspace}") key = "{bksp}";
                if (button === "{enter}") key = "{enter}";
                if (button === "{space}") key = "{space}";
                if (button === "{lock}" || button === "{caps}") {
                    toggleCaps();
                    return;
                }
                if (button === "{accent}") {
                    setLayout("accent");
                    return;
                }
                if (button === "{abc}") {
                    setLayout("default");
                    return;
                }

                handleKeyPress(key);
            },
            layout: {
                default: [
                    "1 2 3 4 5 6 7 8 9 0",
                    "q w e r t y u i o p",
                    "{lock} a s d f g h j k l",
                    "z x c v b n m , . {bksp}",
                    "{accent} {space} {enter}"
                ],
                shift: [
                    "1 2 3 4 5 6 7 8 9 0",
                    "Q W E R T Y U I O P",
                    "{lock} A S D F G H J K L",
                    "Z X C V B N M , . {bksp}",
                    "{accent} {space} {enter}"
                ],
                accent: [
                    "á à â ã é ê í ó ô õ ú ç",
                    "{abc} {space} {enter}"
                ],
                accentShift: [
                    "Á À Â Ã É Ê Í Ó Ô Õ Ú Ç",
                    "{abc} {space} {enter}"
                ],
                numeric: [
                    "1 2 3",
                    "4 5 6",
                    "7 8 9",
                    "00 0 {bksp}",
                    "{enter}"
                ]
            },
            display: {
                "{bksp}": "⌫",
                "{enter}": "Enter ↵",
                "{space}": "Espaço",
                "{lock}": "Caps Lock",
                "{accent}": "Áàã...",
                "{abc}": "Abc",
            },
            buttonTheme: [
                {
                    class: "hg-button-primary",
                    buttons: "{enter}"
                },
                {
                    class: "hg-button-special",
                    buttons: "{bksp} {lock} 00 {accent} {abc}"
                }
            ]
        });

        return () => {
            keyboardRef.current?.destroy();
        };
    }, [isVisible, layout, toggleCaps, handleKeyPress, setLayout]);

    // Sync layout and highlighting with library
    useEffect(() => {
        if (!keyboardRef.current) return;

        let targetLayout: string = layout;
        const wantUpper = isCaps !== (isShift && layout !== "numeric");

        if (layout === "default" && wantUpper) {
            targetLayout = "shift";
        } else if (layout === "accent" && wantUpper) {
            targetLayout = "accentShift";
        }

        const themes = [
            { class: "hg-button-primary", buttons: "{enter}" },
            { class: "hg-button-special", buttons: "{bksp} {lock} 00 {accent} {abc}" }
        ];

        if (isCaps) {
            themes.push({ class: "hg-button-active", buttons: "{lock}" });
        }

        keyboardRef.current.setOptions({
            layoutName: targetLayout,
            buttonTheme: themes
        });
    }, [isVisible, layout, isShift, isCaps]);

    if (!mounted || !isVisible) return null;

    // Draggable Logic
    const onPointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y,
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragRef.current || !mainContainerRef.current) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        const nextX = dragRef.current.startPosX + dx;
        const nextY = dragRef.current.startPosY + dy;

        mainContainerRef.current.style.transform = `translate(calc(-50% + ${nextX}px), ${nextY}px)`;
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (!isDragging || !dragRef.current) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        setPosition({
            x: dragRef.current.startPosX + dx,
            y: dragRef.current.startPosY + dy,
        });

        setIsDragging(false);
        dragRef.current = null;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    const keyboardContent = (
        <div
            ref={mainContainerRef}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999999] animate-in slide-in-from-bottom duration-200"
            style={{
                transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`,
                touchAction: "none",
                willChange: "transform"
            }}
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
            onMouseDown={(e) => {
                e.preventDefault();
            }}
        >
            <div
                id="virtual-keyboard"
                className={cn(
                    "bg-card border border-primary/20 rounded-md p-4 overflow-hidden shadow-2xl pointer-events-auto",
                    layout === "numeric" ? "w-[440px]" : "w-[960px] max-w-[95vw]"
                )}
            >
                {/* Drag Handle */}
                <div
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    className="flex justify-center mb-4 relative cursor-grab active:cursor-grabbing group p-2 -mt-2"
                >
                    <div className="w-24 h-2 bg-muted-foreground/30 rounded-full group-hover:bg-muted-foreground/50 transition-colors" />
                    <button
                        onClick={closeKeyboard}
                        className="absolute right-0 top-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronDown className="w-8 h-8" />
                    </button>
                </div>

                {/* Simple Keyboard Container */}
                <div
                    ref={containerRef}
                    className="simple-keyboard-theme"
                />
            </div>
        </div>
    );

    return createPortal(keyboardContent, document.body);
}
