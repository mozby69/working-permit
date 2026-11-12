
"use client";

import type { ReactNode } from "react";
import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/TableAction/DropdownMenu";

interface TableRowActionsProps<T> {
  item: T;

  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;

  trigger?: ReactNode;
}

export default function TableRowActions<T>({
  item,
  onView,
  onEdit,
  onDelete,
  viewLabel = "View Details",
  editLabel = "Edit",
  deleteLabel = "Delete",
  trigger,
}: TableRowActionsProps<T>) {
  if (!onView && !onEdit && !onDelete) {
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
            transition-colors hover:bg-slate-100
            hover:text-slate-800
          "
        >
          {trigger ?? <Ellipsis size={19} />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44"
        onClick={(event) => event.stopPropagation()}
      >
        {onView && (
          <DropdownMenuItem onSelect={() => onView(item)}>
            <Eye size={15} />
            {viewLabel}
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem onSelect={() => onEdit(item)}>
            <Pencil size={15} />
            {editLabel}
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            {(onView || onEdit) && (
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
