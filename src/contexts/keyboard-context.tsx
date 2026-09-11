"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

// Define the shape of our context
interface KeyboardContextType {
  isVisible: boolean;
  layout: "default" | "numeric" | "accent";
  isShift: boolean;
  isCaps: boolean;
  activeInput: HTMLInputElement | HTMLTextAreaElement | null;
  openKeyboard: (input: HTMLInputElement | HTMLTextAreaElement) => void;
  closeKeyboard: () => void;
  handleKeyPress: (key: string) => void;
  toggleShift: () => void;
  toggleCaps: () => void;
  setLayout: (layout: "default" | "numeric" | "accent") => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeInput, setActiveInput] = useState<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);
  const [layout, setLayout] = useState<"default" | "numeric" | "accent">(
    "default"
  );
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);

  // Global listener for focusin/focus to auto-detect inputs
  useEffect(() => {
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;

      if (
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement) &&
        !target.dataset.noKeyboard
      ) {
        const input = target as HTMLInputElement;
        const type = input.type;
        const inputMode = input.inputMode;
        const dataLayout = input.getAttribute("data-layout");

        // Enhanced numeric detection
        const isNumeric =
          type === "number" ||
          type === "tel" ||
          inputMode === "numeric" ||
          dataLayout === "numeric";

        setLayout(isNumeric ? "numeric" : "default");
        setActiveInput(target as HTMLInputElement | HTMLTextAreaElement);
        setIsVisible(true);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focus", handleFocusIn, true); // Capture phase to catch autoFocus
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focus", handleFocusIn, true);
    };
  }, []);

  // Safety sync: ensure layout matches the active input if it transitions or re-mounts
  useEffect(() => {
    if (!activeInput) return;
    const input = activeInput;
    const type = input.type;
    const inputMode = input.inputMode;
    const dataLayout = input.getAttribute("data-layout");

    const isNumeric =
      type === "number" ||
      type === "tel" ||
      inputMode === "numeric" ||
      dataLayout === "numeric";
    const targetLayout = isNumeric ? "numeric" : "default";

    // Only switch if it's currently on default/numeric (don't break 'accent' manually selected)
    if (layout !== "accent" && layout !== targetLayout) {
      setLayout(targetLayout);
    }
  }, [activeInput]);

  const openKeyboard = React.useCallback(
    (input: HTMLInputElement | HTMLTextAreaElement) => {
      setActiveInput(input);
      setIsVisible(true);
    },
    []
  );

  const closeKeyboard = React.useCallback(() => {
    setIsVisible(false);
    setActiveInput(null);
  }, []);

  const toggleShift = React.useCallback(() => setIsShift((prev) => !prev), []);
  const toggleCaps = React.useCallback(() => setIsCaps((prev) => !prev), []);

  const handleKeyPress = React.useCallback(
    (key: string) => {
      if (!activeInput) return;

      const input = activeInput;
      const currentVal = input.value;
      const start = input.selectionStart ?? currentVal.length;
      const end = input.selectionEnd ?? currentVal.length;

      let charToInsert = key;
      let isSpecialAction = false;

      if (key === "{bksp}") {
        isSpecialAction = true;
        let nextVal = currentVal;
        let nextCursor = start;
        if (start === end) {
          if (start > 0) {
            nextVal =
              currentVal.substring(0, start - 1) + currentVal.substring(end);
            nextCursor = start - 1;
          }
        } else {
          nextVal = currentVal.substring(0, start) + currentVal.substring(end);
          nextCursor = start;
        }
        updateInputValue(input, nextVal, nextCursor);
      } else if (key === "{space}") {
        charToInsert = " ";
      } else if (key === "{enter}") {
        isSpecialAction = true;
        const event = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          bubbles: true,
          cancelable: true,
        });
        input.dispatchEvent(event);

        // For textareas, we might want to actually insert a newline if default not prevented
        if (input instanceof HTMLTextAreaElement && !event.defaultPrevented) {
          const nextVal =
            currentVal.substring(0, start) + "\n" + currentVal.substring(end);
          updateInputValue(input, nextVal, start + 1);
        } else {
          // If not a textarea or default prevented, we close the keyboard as requested
          closeKeyboard();
        }
      } else if (key === "{shift}") {
        toggleShift();
        isSpecialAction = true;
      } else if (key === "{caps}") {
        toggleCaps();
        isSpecialAction = true;
      } else if (key === "00") {
        charToInsert = "00";
      }

      if (!isSpecialAction) {
        // Apply Shift/Caps logic to alphabetic characters
        let finalKey = charToInsert;
        if (
          charToInsert.length === 1 &&
          /[a-z\u00C0-\u00FF]/i.test(charToInsert)
        ) {
          const wantUpper = isCaps !== isShift; // XOR logic for Shift vs Caps
          finalKey = wantUpper
            ? charToInsert.toUpperCase()
            : charToInsert.toLowerCase();
        }

        const nextVal =
          currentVal.substring(0, start) + finalKey + currentVal.substring(end);
        const nextCursor = start + finalKey.length;
        updateInputValue(input, nextVal, nextCursor);

        // If it was a Shift (not Caps), release it after one key
        if (isShift) setIsShift(false);
      }
    },
    [activeInput, isCaps, isShift, toggleShift, toggleCaps, closeKeyboard]
  );

  const updateInputValue = (
    input: HTMLInputElement | HTMLTextAreaElement,
    nextVal: string,
    nextCursor: number
  ) => {
    const proto =
      input instanceof HTMLInputElement
        ? HTMLInputElement.prototype
        : HTMLTextAreaElement.prototype;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      proto,
      "value"
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, nextVal);
    } else {
      input.value = nextVal;
    }

    // Dispatch events
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    // Restore cursor
    requestAnimationFrame(() => {
      try {
        input.focus({ preventScroll: true }); // Ensure it has focus without jumping
        const isSelectionSupported = input.selectionStart !== null;
        if (
          isSelectionSupported &&
          typeof input.setSelectionRange === "function"
        ) {
          input.setSelectionRange(nextCursor, nextCursor);
        }
      } catch (e) {}
    });
  };

  return (
    <KeyboardContext.Provider
      value={{
        isVisible,
        layout,
        isShift,
        isCaps,
        activeInput,
        openKeyboard,
        closeKeyboard,
        handleKeyPress,
        toggleShift,
        toggleCaps,
        setLayout,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (context === undefined) {
    throw new Error("useKeyboard must be used within a KeyboardProvider");
  }
  return context;
}
