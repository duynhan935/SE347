import React from "react";

const Button = ({
        className,
        children,
        title,
        type,
        onClickFunction,
        disabled,
}: {
        className?: string;
        children?: React.ReactNode;
        title?: string;
        type?: "button" | "submit" | "reset";
        onClickFunction?: () => void;
        disabled?: boolean;
}) => {
        if (onClickFunction) {
                return (
                        <button
                                className={`btn ${className}`}
                                title={title}
                                type={type || "button"}
                                onClick={onClickFunction}
                                disabled={disabled}
                        >
                                {children}
                        </button>
                );
        }
        return (
                <button
                        className={`btn ${className}`}
                        title={title}
                        type={type || "button"}
                        onClick={onClickFunction}
                        disabled={disabled}
                >
                        {children}
                </button>
        );
};

export default Button;
