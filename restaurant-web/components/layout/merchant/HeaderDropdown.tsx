import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ReactNode } from "react";

interface HeaderDropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    width?: string;
    align?: "start" | "end" | "center";
}

export default function HeaderDropdown({ trigger, children, width = "w-64", align = "start" }: HeaderDropdownProps) {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
            <DropdownMenu.Content
                sideOffset={8}
                align={align}
                className={`${width} bg-white rounded shadow border border-gray-200 z-10 py-2`}
            >
                {children}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}
