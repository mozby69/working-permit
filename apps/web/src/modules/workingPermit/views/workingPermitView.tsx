"use client";
import Modal from "@/components/common/ModalHeader";
import { FilesIcon, Plus } from "lucide-react";
import ModalAddRequest from "../components/modal/AddRequest";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useDebounce } from "@/hooks/useDebounce";
import { useState } from "react";
import { useGetWorkingPermit } from "../hooks/useWorkingPermit";
import { TableColumn } from "@/components/common/Table";
import { formatCurrency, WorkingPermitResponse } from "@repo/shared";
import DataTable from "@/components/common/Datatable/Datatable";




export default function WorkingPermitView(){
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [userPage, setUserPage] = useState(1);
    const [userLimit, setUserLimit] = useState(10);
    const [userSearch, setUserSearch] = useState("");
    const debouncedSearch = useDebounce(userSearch, 500);
    const userModal = useDisclosure();



      const openModal = () => {
        userModal.open();
      }


      const {
      data: wpResponse,
      isPending,
      isFetching,
    } = useGetWorkingPermit({
      page: userPage,
      limit: userLimit,
      search: debouncedSearch,
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
        // {
        //   key: "branchDepartment",
        //   header: "Branch",
        //   render: (row) => (
        //     <span className="capitalize">
        //       {row.branchDepartment}
        //     </span>
        //   ),
        // },
        {
          key: "requestLevel",
          header: "Level",
          render: (row) => (
            <span className="capitalize">
              {row.requestLevel}
            </span>
          ),
        },
     
      ];




    return(
      <div className="w-full min-w-0 space-y-6 p-2">


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



    

  </div>
    );
}