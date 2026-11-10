
"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

type DepartmentBranch = {
  id: number;
  entityName: string;
};

type DepartmentBranchSelectProps = {
  value?: number;
  onChange: (value: number) => void;
  departments: DepartmentBranch[];
  disabled?: boolean;
  invalid?: boolean;
};

export function DepartmentBranchSelect({
  value,
  onChange,
  departments,
  disabled = false,
  invalid = false,
}: DepartmentBranchSelectProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = departments.find(
    (department) => department.id === value
  );

const filteredDepartments = departments.filter((department) =>
  (department.entityName ?? "")
    .toLowerCase()
    .includes(search.trim().toLowerCase())
);


  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();

      if (!rect) return;

      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-haspopup="listbox"
        aria-invalid={invalid}
        onClick={() => {
          if (!open) setSearch("");
          setOpen((previous) => !previous);
        }}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3.5 text-left text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 ${
          invalid ? "border-red-500" : "border-slate-200"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.entityName ?? "Select department / branch"}
        </span>

        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 99999,
            }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl"
          >
            <div className="border-b border-slate-100 p-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search className="h-4 w-4 text-slate-400" />

                <input
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search department..."
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div
              id={listboxId}
              role="listbox"
              aria-label="Departments and branches"
              className="max-h-56 overflow-y-auto p-1.5"
            >
              {filteredDepartments.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-slate-500">
                  No departments found
                </p>
              ) : (
                filteredDepartments.map((department) => (
                  <button
                    key={department.id}
                    type="button"
                    role="option"
                    aria-selected={department.id === value}
                    onClick={() => {
                      onChange(department.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-900 hover:bg-blue-50"
                  >
                    <span>{department.entityName}</span>

                    {department.id === value && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
