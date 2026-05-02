import React from "react";
import { toast as sonnerToast } from "sonner";

function DefaultClose() {
  return (
    <button
      onClick={() => sonnerToast.dismiss()}
      className="font-medium"
      aria-label="Close notification"
    >
      ✕
    </button>
  );
}

export const toast = {
  success: (title: string, opts?: any) =>
    sonnerToast.success(title, { ...opts, action: opts?.action ?? <DefaultClose /> }),
  error: (title: string, opts?: any) =>
    sonnerToast.error(title, { ...opts, action: opts?.action ?? <DefaultClose /> }),
  message: (title: string, opts?: any) =>
    sonnerToast.message(title, { ...opts, action: opts?.action ?? <DefaultClose /> }),
  // expose dismiss for direct calls
  dismiss: sonnerToast.dismiss,
};

export default toast;
