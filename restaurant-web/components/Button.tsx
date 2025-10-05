import React from "react";

const Button = ({
        className,
        children,
        title,
        type,
        onClickFunction,
}: {
        className?: string;
        children?: React.ReactNode;
        title?: string;
        type?: "button" | "submit" | "reset";
        onClickFunction?: () => void;
}) => {
        if (onClickFunction) {
                return (
                        <button
                                className={`btn ${className}`}
                                title={title}
                                type={type || "button"}
                                onClick={onClickFunction}
                        >
                                {children}
                        </button>
                );
        }
        return (
                <button className={`btn ${className}`} title={title} type={type || "button"} onClick={onClickFunction}>
                        {children}
                </button>
        );
};

export default Button;
