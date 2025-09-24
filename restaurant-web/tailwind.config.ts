import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand colors từ globals.css
                "brand-purple": "var(--color-brand-purple)",
                "brand-green": "var(--color-brand-green)",
                "brand-orange": "var(--color-brand-orange)",
                "brand-yellow": "var(--color-brand-yellow)",
                "brand-black": "var(--color-brand-black)",
                "brand-grey": "var(--color-brand-grey)",
                "brand-white": "var(--color-brand-white)",
                "brand-yellowlight": "var(--color-brand-yellowlight)",
                "brand-purplelight": "var(--color-brand-purplelight)",

                // Shadcn colors
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                card: {
                    DEFAULT: "var(--color-card)",
                    foreground: "var(--color-card-foreground)",
                },
                popover: {
                    DEFAULT: "var(--color-popover)",
                    foreground: "var(--color-popover-foreground)",
                },
                primary: {
                    DEFAULT: "var(--color-primary)",
                    foreground: "var(--color-primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    foreground: "var(--color-secondary-foreground)",
                },
                muted: {
                    DEFAULT: "var(--color-muted)",
                    foreground: "var(--color-muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    foreground: "var(--color-accent-foreground)",
                },
                destructive: "var(--color-destructive)",
                border: "var(--color-border)",
                input: "var(--color-input)",
                ring: "var(--color-ring)",
                chart: {
                    "1": "var(--color-chart-1)",
                    "2": "var(--color-chart-2)",
                    "3": "var(--color-chart-3)",
                    "4": "var(--color-chart-4)",
                    "5": "var(--color-chart-5)",
                },
                sidebar: {
                    DEFAULT: "var(--color-sidebar)",
                    foreground: "var(--color-sidebar-foreground)",
                    primary: "var(--color-sidebar-primary)",
                    "primary-foreground": "var(--color-sidebar-primary-foreground)",
                    accent: "var(--color-sidebar-accent)",
                    "accent-foreground": "var(--color-sidebar-accent-foreground)",
                    border: "var(--color-sidebar-border)",
                    ring: "var(--color-sidebar-ring)",
                },
            },
            fontSize: {
                h1: "var(--text-h1)",
                h2: "var(--text-h2)",
                h3: "var(--text-h3)",
                h4: "var(--text-h4)",
                h5: "var(--text-h5)",
                h6: "var(--text-h6)",
                button1: "var(--text-button1)",
                button2: "var(--text-button2)",
                button3: "var(--text-button3)",
                p1: "var(--text-p1)",
                p2: "var(--text-p2)",
                p3: "var(--text-p3)",
            },
            fontFamily: {
                "roboto-serif": "var(--font-roboto-serif)",
                manrope: "var(--font-manrope)",
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                xl: "var(--radius-xl)",
            },
        },
    },
    plugins: [],
};

export default config;
