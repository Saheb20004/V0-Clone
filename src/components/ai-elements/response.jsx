"use client";
import { cn } from "@/lib/utils";
import { memo } from "react";
import ReactMarkdown from "react-markdown";

export const Response = memo(({ className, children }) => (
  <div className={cn("prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </div>
), (prevProps, nextProps) => prevProps.children === nextProps.children);

Response.displayName = "Response";
