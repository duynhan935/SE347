// File: components/ui/accordion.tsx
"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
        React.ElementRef<typeof AccordionPrimitive.Item>,
        React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
        <AccordionPrimitive.Item
                ref={ref}
                className={cn(
                        "mb-4 rounded-lg border bg-white/50 transition-all duration-300 data-[state=open]:bg-white data-[state=open]:shadow-lg",
                        className
                )}
                {...props}
        />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
        React.ElementRef<typeof AccordionPrimitive.Trigger>,
        React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
        <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                        ref={ref}
                        className={cn(
                                "flex flex-1 items-center justify-between p-4 font-medium transition-all hover:underline [&[data-state=open]>div>svg.plus]:hidden [&[data-state=open]>div>svg.minus]:block",
                                className
                        )}
                        {...props}
                >
                        {children}

                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-200 transition-colors  cursor-pointer">
                                <Plus className="plus h-5 w-5 rounded-full text-brand-black transition-opacity" />
                                <Minus className="minus h-5 w-5 rounded-full  text-brand-purple transition-opacity hidden" />
                        </div>
                </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
        React.ElementRef<typeof AccordionPrimitive.Content>,
        React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
        <AccordionPrimitive.Content
                ref={ref}
                className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                {...props}
        >
                <div className={cn("px-4 pb-4 pt-0", className)}>{children}</div>
        </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
