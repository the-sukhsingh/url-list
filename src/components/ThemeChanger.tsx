"use client";

import { MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback } from "react";
import { useMetaColor } from "@/hooks/meta-color";
import { META_THEME_COLORS } from "@/hooks/meta-color";
export function ToggleTheme() {
    const { resolvedTheme, setTheme } = useTheme();
    const { setMetaColor } = useMetaColor();


    const handleToggle = useCallback(() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        setMetaColor(
            resolvedTheme === "dark"
                ? META_THEME_COLORS.light
                : META_THEME_COLORS.dark
        );
    }, [resolvedTheme, setTheme]);

    return (
        <button onClick={handleToggle} className="absolute top-4 right-4 z-50">
            <MoonStarIcon className="hidden [html.dark_&]:block" />
            <SunIcon className="hidden [html.light_&]:block" />
            <span className="sr-only">Toggle Theme</span>
        </button>
    );
}