
interface DetailFieldProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}



export function DetailField({
  label,
  value,
  icon,
}: DetailFieldProps) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon && (
          <span className="text-slate-400">{icon}</span>
        )}
        {label}
      </div>

      <p className="break-words text-sm font-semibold text-slate-800">
        {value === null || value === undefined || value === ""
          ? "Not specified"
          : value}
      </p>
    </div>
  );
}

export function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}