
"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Ellipsis,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/TableAction/DropdownMenu";

// ==========================================
// CUSTOM ACTION TYPE
// ==========================================

export interface CustomTableAction<T> {
  key: string;
  label: string;
  icon?: LucideIcon;

  onClick: (item: T) => void;

  hidden?: boolean;
  disabled?: boolean;

  variant?: "default" | "destructive";
}

// ==========================================
// COMPONENT PROPS
// ==========================================

interface TableRowActionsProps<T> {
  item: T;

  // Default actions
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;

  // Dynamic custom actions
  customActions?: CustomTableAction<T>[];

  trigger?: ReactNode;
}

// ==========================================
// COMPONENT
// ==========================================

export default function TableRowActions<T>({
  item,

  onView,
  onEdit,
  onDelete,

  viewLabel = "View Details",
  editLabel = "Edit",
  deleteLabel = "Delete",

  customActions = [],

  trigger,
}: TableRowActionsProps<T>) {
  const visibleCustomActions = customActions.filter(
    (action) => !action.hidden
  );

  const hasDefaultActions = Boolean(onView || onEdit);
  const hasCustomActions = visibleCustomActions.length > 0;

  if (
    !hasDefaultActions &&
    !hasCustomActions &&
    !onDelete
  ) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Row actions"
          onClick={(event) => event.stopPropagation()}
          className="
            flex h-8 w-8 items-center justify-center
            rounded-lg text-slate-500
            transition-colors
            hover:bg-slate-100
            hover:text-slate-800
          "
        >
          {trigger ?? <Ellipsis size={19} />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(event) => event.stopPropagation()}
      >
        {/* VIEW */}
        {onView && (
          <DropdownMenuItem
            onSelect={() => onView(item)}
          >
            <Eye size={15} />
            {viewLabel}
          </DropdownMenuItem>
        )}

        {/* EDIT */}
        {onEdit && (
          <DropdownMenuItem
            onSelect={() => onEdit(item)}
          >
            <Pencil size={15} />
            {editLabel}
          </DropdownMenuItem>
        )}

        {/* CUSTOM ACTIONS */}
        {hasCustomActions && (
          <>
            {hasDefaultActions && (
              <DropdownMenuSeparator />
            )}

            {visibleCustomActions.map((action) => {
              const Icon = action.icon;

              return (
                <DropdownMenuItem
                  key={action.key}
                  disabled={action.disabled}
                  variant={action.variant ?? "default"}
                  onSelect={() => action.onClick(item)}
                >
                  {Icon && <Icon size={15} />}

                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {/* DELETE */}
        {onDelete && (
          <>
            {(hasDefaultActions || hasCustomActions) && (
              <DropdownMenuSeparator />
            )}

            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(item)}
            >
              <Trash2 size={15} />
              {deleteLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
