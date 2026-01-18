declare module "@uiw/react-md-editor" {
    import * as React from "react";

    export type MDEditorPreview = "live" | "edit" | "preview";

    export interface MDEditorProps {
        value?: string;
        onChange?: (value?: string) => void;
        height?: number;
        preview?: MDEditorPreview;
        visibleDragbar?: boolean;
        onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
        onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
    }

    const MDEditor: React.ComponentType<MDEditorProps>;
    export default MDEditor;
}

declare module "react-markdown" {
    import * as React from "react";

    export interface ReactMarkdownProps {
        children?: string;
        className?: string;
        remarkPlugins?: unknown[];
    }

    const ReactMarkdown: React.ComponentType<ReactMarkdownProps>;
    export default ReactMarkdown;
}

declare module "remark-gfm" {
    const remarkGfm: unknown;
    export default remarkGfm;
}
