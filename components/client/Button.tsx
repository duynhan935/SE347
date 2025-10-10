"use client";

import { ButtonHTMLAttributes } from "react";

const Button = ({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
        return (
                <button
                        className={`inline-flex items-center justify-center rounded-md px-8 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
                        {...props}
                >
                        {children}
                </button>
        );
};

export default Button;
