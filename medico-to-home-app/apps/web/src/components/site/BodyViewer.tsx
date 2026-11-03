"use client";

import { createElement, useEffect } from "react";

export function BodyViewer({ focus }: { focus: string }) {
  useEffect(() => {
    import("./mth-body");
  }, []);
  return createElement("mth-body", { focus });
}
