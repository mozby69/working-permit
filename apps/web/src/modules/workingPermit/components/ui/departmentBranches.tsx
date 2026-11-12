
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

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "top" | "bottom";
};

const DROPDOWN_HEIGHT = 300;
const GAP = 6;
const VIEWPORT_PADDING = 12;

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

  const [position, setPosition] =
    useState<DropdownPosition>({
      top: 0,
      left: 0,
      width: 0,
      maxHeight: DROPDOWN_HEIGHT,
      placement: "bottom",
    });

  const selected = departments.find(
    (department) => department.id === value
  );

  const filteredDepartments = departments.filter(
    (department) =>
      (department.entityName ?? "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect =
        triggerRef.current?.getBoundingClientRect();

      if (!rect) return;

      const spaceBelow =
        window.innerHeight -
        rect.bottom -
        VIEWPORT_PADDING;

      const spaceAbove =
        rect.top - VIEWPORT_PADDING;

      const placement: "top" | "bottom" =
        spaceBelow >= DROPDOWN_HEIGHT ||
        spaceBelow >= spaceAbove
          ? "bottom"
          : "top";

      const availableSpace =
        placement === "bottom"
          ? spaceBelow
          : spaceAbove;

      const maxHeight = Math.max(
        0,
        Math.min(DROPDOWN_HEIGHT, availableSpace - GAP)
      );

      const top =
        placement === "bottom"
          ? rect.bottom + GAP
          : rect.top - maxHeight - GAP;

      const width = Math.min(
        Math.max(rect.width, 240),
        window.innerWidth - VIEWPORT_PADDING * 2
      );

      const left = Math.max(
        VIEWPORT_PADDING,
        Math.min(
          rect.left,
          window.innerWidth - width - VIEWPORT_PADDING
        )
      );

      setPosition({
        top,
        left,
        width,
        maxHeight,
        placement,
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

    const handleScroll = (event: Event) => {
      const target = event.target;

      // Ignore scrolling inside the dropdown itself.
      if (
        target instanceof Node &&
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      // Close when the modal/page scrolls to avoid
      // a floating dropdown detached from its input.
      setOpen(false);
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    // Capture scrolling from the modal and page.
    document.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition
      );

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
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
        className={`
          flex h-11 w-full items-center
          justify-between gap-2 rounded-lg
          border bg-white px-3.5 text-left
          text-sm text-slate-800 outline-none
          transition-colors
          focus:ring-2 focus:ring-blue-100
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${
            invalid
              ? "border-red-500"
              : "border-slate-200 hover:border-slate-300"
          }
        `}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.entityName ??
            "Select department / branch"}
        </span>

        <ChevronDown
          className={`
            h-4 w-4 shrink-0 text-slate-500
            transition-transform duration-200
            ${open ? "rotate-180" : ""}
          `}
        />
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
              maxHeight: position.maxHeight,
              zIndex: 99999,
            }}
            className="
              flex flex-col overflow-hidden
              rounded-xl border border-slate-200
              bg-white text-slate-900
              shadow-[0_12px_35px_rgba(15,23,42,0.16)]
            "
          >
            {/* SEARCH */}
            <div className="shrink-0 border-b border-slate-100 p-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-400">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />

                <input
                  autoFocus
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search department..."
                  className="
                    h-10 min-w-0 flex-1
                    bg-transparent text-sm text-slate-900
                    outline-none
                    placeholder:text-slate-400
                  "
                />
              </div>
            </div>

            {/* SCROLLABLE OPTIONS */}
            <div
              id={listboxId}
              role="listbox"
              aria-label="Departments and branches"
              className="
                min-h-0 flex-1
                overflow-y-auto overscroll-contain
                p-1.5
              "
            >
              {filteredDepartments.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-slate-500">
                  No departments found
                </p>
              ) : (
                filteredDepartments.map((department) => {
                  const isSelected =
                    department.id === value;

                  return (
                    <button
                      key={department.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(department.id);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`
                        flex w-full items-center
                        justify-between gap-2
                        rounded-lg px-3 py-2.5
                        text-left text-sm
                        transition-colors
                        ${
                          isSelected
                            ? "bg-blue-50 font-medium text-blue-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }
                      `}
                    >
                      <span className="min-w-0 break-words">
                        {department.entityName}
                      </span>

                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-blue-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
