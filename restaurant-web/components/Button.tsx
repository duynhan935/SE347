import React from "react";

const Button = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
        return <button className={`btn ${className}`}>{children}</button>;
};

export default Button;
