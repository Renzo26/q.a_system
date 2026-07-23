import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: ReactNode;
  addon?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon, error, hint, addon, type = "text", className, id, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const isPassword = type === "password";
  const [reveal, setReveal] = useState(false);
  const inputType = isPassword ? (reveal ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-[13px] font-semibold text-ink">
          {label}
        </label>
      )}
      <div
        className={cn(
          "group flex items-center rounded-xl border bg-surface transition-all duration-200",
          "focus-within:ring-4",
          error
            ? "border-risk-high/60 focus-within:border-risk-high focus-within:ring-risk-high/15"
            : "border-line focus-within:border-ink/30 focus-within:ring-brand/25",
        )}
      >
        {icon && <span className="grid place-items-center pl-3.5 text-ink-mute">{icon}</span>}
        {addon && (
          <span className="border-r border-line py-2.5 pl-3.5 pr-3 font-mono text-[13px] text-ink-mute">
            {addon}
          </span>
        )}
        <input
          id={fieldId}
          ref={ref}
          type={inputType}
          className={cn(
            "h-11 w-full bg-transparent px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-mute",
            icon && "pl-2.5",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="grid place-items-center px-3.5 text-ink-mute transition-colors hover:text-ink"
            aria-label={reveal ? "Ocultar senha" : "Mostrar senha"}
            tabIndex={-1}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-risk-high">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-ink-mute">{hint}</p>
      ) : null}
    </div>
  );
});
