"use client";
import Modal from "@/components/common/ModalHeader";
import { FilesIcon, Plus,CalendarDays, X, MessageSquarePlus } from "lucide-react";
import ModalAddRequest from "../components/modal/AddRequest";
// import { useDisclosure } from "@/hooks/useDisclosure";
import { useDebounce } from "@/hooks/useDebounce";
import { useState } from "react";
import { useGetWorkingPermit, useWorkerList } from "../hooks/useWorkingPermit";
import { TableColumn } from "@/components/common/Table";
import {  WorkingPermitResponse } from "@repo/shared";
import DataTable from "@/components/common/Datatable/Datatable";
import WorkingPermitStatusBadge from "../components/ui/workingPermitStatusBadge"; 
import TableRowActions from "@/components/common/TableAction/DropdownAction";
import ViewWorkingPermit from "../components/modal/ViewWorkingPermit";
import { useWPSocket } from "../hooks/useWorkingPermitSocket";
import EditWorkingPermit from "../components/modal/EditWorkingPermit";
import AddRemark from "../components/modal/AddRemarks";


export default function WorkingPermitView(){
    useWPSocket()
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [userPage, setUserPage] = useState(1);
    const [userLimit] = useState(10);
    const [userSearch, setUserSearch] = useState("");
    const debouncedSearch = useDebounce(userSearch, 500);
    const [editingPermit, setEditingPermit] = useState<WorkingPermitResponse | null>(null);
    const [selectedPermit, setSelectedPermit] = useState<WorkingPermitResponse | null>(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
    const [remarkPermit, setRemarkPermit] =useState<WorkingPermitResponse | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [showDateFilter, setShowDateFilter] = useState(false);

    const {
      data: workers = [],
      isLoading: isWorkersLoading,
    } = useWorkerList();


    const {
      data: wpResponse,
      isPending,
      isFetching,
      isError,
      error,
    } = useGetWorkingPermit({
      page: userPage,
      limit: userLimit,
      search: debouncedSearch,

      requestToId: selectedWorkerId ?? undefined,

      date: selectedDate || undefined,
    });


    const workingPermits: WorkingPermitResponse[] =  wpResponse?.data ?? [];

    const totalRecords = wpResponse?.pagination?.total ?? 0;




      const columns: TableColumn<WorkingPermitResponse>[] = [
        {
          key: "referenceNumber",
          header: "Reference Number",
          render: (row) => (
            <span className="font-semibold text-[#26342F]">
              {row.referenceNumber}
            </span>
          ),
        },
        {
          key: "requestedBy",
          header: "Requested by",
          render: (row) => (
            <span className="font-medium text-[#26342F]">
              {(row.requestedBy)}
            </span>
          ),
        },
        {
          key: "branchDepartment",
          header: "Branch",
          render: (row) => (
            <span className="capitalize">
              {row.branchDepartment.entityName}
            </span>
          ),
        },
        {
          key: "requestLevel",
          header: "Level",
          render: (row) => (
            <span className="inline-block whitespace-nowrap capitalize">
              {row.requestLevel.replaceAll("_", " ")}
            </span>
          ),
        },
         {
          key: "fromDepartment",
          header: "From",
          render: (row) => (
            <span className="capitalize">
              {row.fromDepartment.entityName}
            </span>
          ),
        },
          
        {
          key: "CheckedStatus",
          header: "Checked Status",
          render: (row) => (
                <WorkingPermitStatusBadge status={(row.approvals.find(stage => stage.role === "CHECKER")?.approvedAt ? "APPROVED" : "PENDING")} />
          ),
        },
        {
          key: "firstApproverStatus",
          header: "Approver 1",
            render: (row) => {
            if (row.requestLevel === "LEVEL_1") {
              return (
                <span
                  title="Final approval is not required for Level 1"
                  className="inline-flex h-7 w-23 items-center justify-center rounded-full border border-slate-400 bg-slate-100 text-[11px] font-semibold text-slate-500"
                >
                  N/A
                </span>
              );
            }

              return (
                <WorkingPermitStatusBadge
                  status={(row.approvals.find(stage => stage.role === "FIRST_APPROVER")?.approvedAt ? "APPROVED" : "PENDING")}
                />
              );
            },
            },
       {
        key: "finalApproverStatus",
        header: "Approver 2",
        render: (row) => (
             <WorkingPermitStatusBadge status={(row.approvals.find(stage => stage.role === "FINAL_APPROVER")?.approvedAt ? "APPROVED" : "PENDING")} />
          ),
      },
      {
          key: "status",
          header: "Status",
          render: (row) => (
            <WorkingPermitStatusBadge status={row.status} />
          ),
        },

      {
        key: "actions",
        header: "Actions",

        render: (row) => (
          <TableRowActions<WorkingPermitResponse>
            item={row}

            // Default View
            viewLabel="View Request"
            onView={(permit) => {
              setSelectedPermit(permit);
              setIsModalOpen2(true);
            }}

            // Default Edit
            editLabel="Edit Request"
            onEdit={
              row.canEdit
                ? (permit) => setEditingPermit(permit)
                : undefined
            }

            // Custom actions
            customActions={[
              {
                key: "add-remark",
                label: "Add Remark",
                icon: MessageSquarePlus,
                hidden: !row.canAddRemarks,

                onClick: (permit) => {
                  setRemarkPermit(permit);
                },
              },
            ]}
          />
        ),
      },
                      
     
      ];


      const handleWorkerFilter = (workerId: number) => {
        setSelectedWorkerId((previous) =>
          previous === workerId ? null : workerId
        );

        setUserPage(1);
      };

      const handleDateChange = (value: string) => {
        setSelectedDate(value);
        setUserPage(1);
      };

      const clearFilters = () => {
        setSelectedWorkerId(null);
        setSelectedDate("");
        setShowDateFilter(false);
        setUserPage(1);
      };

      const hasActiveFilters =
        selectedWorkerId !== null || selectedDate !== "";

    return(
      <div className="w-full min-w-0 space-y-6 px-8 py-2">


    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


      <div className="flex min-w-0 items-start gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DCE2EC] bg-[#E4E9FA]">
          <FilesIcon
            size={20}
            strokeWidth={1.7}
        className="text-[#303C87]"
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-[#26342F]">
            Working Permit
          </h1>

          <p className="mt-1 text-[13px] leading-relaxed text-[#8A958C]">
          Add a Working Permit Request feature and enable real-time viewing of submitted requests
          </p>
        </div>
      </div>


      <button
        type="button"
        onClick={() => {
             // setSaveError(null);
              setIsAddOpen(true);
            }}
        className="
          inline-flex h-10 shrink-0 items-center
          justify-center gap-2 rounded-[10px]
          bg-[#4F46E5] px-4
          text-[12px] font-semibold text-white
          shadow-sm transition-all duration-200
          hover:bg-[#4338CA]
          hover:shadow-md
          active:scale-[0.98]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#4338CA]
          focus-visible:ring-offset-2
          sm:w-auto
        "
      >
        <Plus size={17} strokeWidth={2} />
        Add Request
      </button>
    </div>


    {isError && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load Working Permits: {error.message}
      </div>
    )}





    {/* WORKING PERMIT FILTERS */}
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {isWorkersLoading ? (
            <span className="px-3 py-2 text-xs text-slate-400">
              Loading departments...
            </span>
          ) : (
            workers.map((worker) => {
              const isActive = selectedWorkerId === worker.id;

              return (
                <button
                  key={worker.id}
                  type="button"
                  onClick={() => handleWorkerFilter(worker.id)}
                  aria-pressed={isActive}
                  className={`inline-flex h-10 items-center justify-center
                    rounded-lg border px-4 text-xs font-semibold
                    transition-all duration-200
                    ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}>
                  {worker.workerName}
                </button>
              );
            })
          )}

          {/* Date filter button */}
          <button
            type="button"
            onClick={() =>
              setShowDateFilter((previous) => !previous)
            }
            aria-expanded={showDateFilter}
            className={`inline-flex h-10 items-center gap-2
              rounded-lg border px-4 text-xs font-semibold
              transition-all duration-200
              ${
                selectedDate
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
          >
            <CalendarDays size={15} />
            Date
          </button>

          {/* Clear all filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-10 items-center gap-1.5
                rounded-lg px-3 text-xs font-medium
                text-slate-500 hover:bg-slate-100 hover:text-red-600"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500">
          {hasActiveFilters ? "Filtered results" : "Showing all permits"}
        </p>
      </div>

      {/* Expandable date picker */}
      {showDateFilter && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
          <div className="space-y-1.5">
            <label
              htmlFor="working-permit-date-filter"
              className="block text-xs font-medium text-slate-600"
            >
              Request date
            </label>

            <input
              id="working-permit-date-filter"
              type="date"
              value={selectedDate}
              onChange={(event) =>
                handleDateChange(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200
                bg-white px-3 text-sm text-slate-700 outline-none
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {selectedDate && (
            <button
              type="button"
              onClick={() => handleDateChange("")}
              className="h-10 rounded-lg border border-slate-200
                px-3 text-xs font-medium text-slate-600
                hover:bg-slate-50"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>


       <DataTable<WorkingPermitResponse>
          title="Working Permit List"
          description="Manage and monitor working permit."
          columns={columns}
          data={workingPermits}
          getRowId={(row) => row.id}
          manualPagination
          page={userPage}
          pageSize={userLimit}
          totalRows={totalRecords}
          onPageChange={setUserPage}
          searchPlaceholder="Search working permit..."
          searchValue={userSearch}
          onSearchChange={(value) => {
            setUserSearch(value);
            setUserPage(1);
          }}
          isLoading={isPending || isFetching}
        />




     <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Request"
        size="lg"
        >

        <ModalAddRequest
            onCancel={() => setIsAddOpen(false)}
            referenceNo="WP10272"
            userOptions={[
            { value: "1", label: "Admin" },
            { value: "2", label: "Branch User" },
            ]}
        />
    </Modal>


      <Modal
        isOpen={isModalOpen2 && selectedPermit !== null}
        onClose={() => {
          setIsModalOpen2(false);
          setSelectedPermit(null);
        }}
        title="Working Permit Details"
        size="xl"
      >
        {selectedPermit && (
          <ViewWorkingPermit
            permit={selectedPermit}
            onCancel={() => {
              setIsModalOpen2(false);
              setSelectedPermit(null);
            }}
            //canApprove={selectedPermit.canApproveChecker}
          />
        )}
      </Modal>



      <Modal
          isOpen={editingPermit !== null}
          onClose={() => setEditingPermit(null)}
          title={
            editingPermit
              ? `Edit Working Permit - ${editingPermit.referenceNumber}`
              : "Edit Working Permit"
          }
          size="lg"
        >
          {editingPermit && (
            <EditWorkingPermit
              key={editingPermit.id}
              permit={editingPermit}
              onCancel={() => setEditingPermit(null)}
            />
          )}
        </Modal>



        <Modal
          isOpen={remarkPermit !== null}
          onClose={() => setRemarkPermit(null)}
          title={
            remarkPermit
              ? `Add Remark - ${remarkPermit.referenceNumber}`
              : "Add Remark"
          }
          size="lg"
        >
          {remarkPermit && (
            <AddRemark
              key={remarkPermit.id}
              permit={remarkPermit}
              onCancel={() => setRemarkPermit(null)}
            />
          )}
        </Modal>

  </div>
    );
}