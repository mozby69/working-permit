import { ReactNode } from "react";

export function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
      {children}
    </div>
  );
}
