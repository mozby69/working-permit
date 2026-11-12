
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useUsers } from "../../hooks/useAccessControl";

// Adjust this import to your existing hook location.

type SelectedUser = {
  id: number;
  name: string;
  username: string;
};

type Props = {
  value: number | null;
  onChange: (id: number | null) => void;
  selectedUser?: SelectedUser | null;
  disabled?: boolean;
};

export function UserCheckerSelect({
  value,
  onChange,
  selectedUser,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [page, setPage] = useState(1);
  const [localSelected, setLocalSelected] =
  useState<SelectedUser | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const limit = 10;

  

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const usersQuery = useUsers({
    page,
    limit,
    search: debouncedSearch,
  });

  const users = usersQuery.data?.data ?? [];

  const pagination = usersQuery.data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

const selected =
  value === null
    ? null
    : localSelected?.id === value
      ? localSelected
      : selectedUser?.id === value
        ? selectedUser
        : users.find((user) => user.id === value) ?? null;

function handleSelect(user: SelectedUser) {
  setLocalSelected(user);
  onChange(user.id);

  setOpen(false);
  setSearch("");
  setPage(1);
}

function handleClear() {
  setLocalSelected(null);
  onChange(null);

  setOpen(false);
  setSearch("");
  setPage(1);
}

  const selectedLabel =
    selected?.name ??
    (value !== null ? `User #${value}` : null);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <div className="flex min-h-11 items-center rounded-lg border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left text-sm"
        >
          <UserRound className="h-4 w-4 shrink-0 text-slate-400" />

          <span
            className={`truncate ${
              selectedLabel
                ? "text-slate-900"
                : "text-slate-400"
            }`}
          >
            {selectedLabel ?? "Select a checker"}
          </span>

          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {value !== null && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Remove checker"
            className="mr-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* SEARCH */}
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name or username..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* USER OPTIONS */}
          <div
            role="listbox"
            aria-label="Select checker"
            className="max-h-56 overflow-y-auto p-1"
          >
            {usersQuery.isFetching ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : usersQuery.isError ? (
              <div className="px-3 py-6 text-center text-sm text-red-600">
                Failed to load users.
                <button
                  type="button"
                  onClick={() => void usersQuery.refetch()}
                  className="ml-2 font-medium underline"
                >
                  Retry
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  role="option"
                  aria-selected={value === user.id}
                  onClick={() =>
                    handleSelect({
                      id: user.id,
                      name: user.name,
                      username: user.username,
                    })
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50 ${
                    value === user.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      @{user.username}
                    </p>
                  </div>

                  {value === user.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
              <button
                type="button"
                disabled={page <= 1 || usersQuery.isFetching}
                onClick={() =>
                  setPage((prev) => Math.max(1, prev - 1))
                }
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  usersQuery.isFetching
                }
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
