import api from "@/lib/api/api-client";

export type DepartmentBranch = {
  id: number;
  entity_name: string;
  isBranch: boolean;
  checkerId: number | null;
  createdAt: string;
};

export type DepartmentBranchFilter = {
  isBranch?: boolean;
};

type DepartmentBranchResponse = {
  success: boolean;
  data: DepartmentBranch[];
};

export async function getDepartmentBranches(
  params: DepartmentBranchFilter = {}
): Promise<DepartmentBranchResponse> {
  const response = await api.get<DepartmentBranchResponse>(
    "/admin/department-branches",
    { params }
  );

  return response.data;
}