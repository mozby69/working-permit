import api from "@/lib/api/api-client";
import { AddRequestInput, QueryParamsDatatable, WorkingPermitResponse, wpListResponseSchema } from "@repo/shared";





export async function addWorkingPermitService(payload: AddRequestInput) {
  const response = await api.post(
    "/working-permit/add-working-permit",
    payload
  );

  return response.data.data;
}



type NextReferenceResponse = {
  success: boolean;
  data: {
    referenceNumber: string;
  };
};

export async function getNextReferenceService(): Promise<string> {
  const response = await api.get<NextReferenceResponse>(
    "/working-permit/next-reference"
  );

  return response.data.data.referenceNumber;

}




export type DepartmentBranch = {
  id: number;
  entityName: string;
  isBranch: boolean;
  checkerId: number | null;
  checker: {
    id: number;
    name: string;
  } | null;
};

type DepartmentBranchApi = {
  id: number;
  entity_name: string;
  isBranch: boolean;
  checkerId: number | null;

  CheckerList: {
    id: number;
    name: string;
  } | null;
};

type DepartmentBranchesResponse = {
  success: boolean;
  data: DepartmentBranchApi[];
};

export async function getDepartmentBranchesService(): Promise<
  DepartmentBranch[]
> {
  const response = await api.get<DepartmentBranchesResponse>(
    "/working-permit/department-branch-list"
  );

  return response.data.data.map((department) => ({
    id: department.id,
    entityName: department.entity_name,
    isBranch: department.isBranch,
    checkerId: department.checkerId,
    checker: department.CheckerList,
  }));
}

export interface WPListResponse {
  success: boolean;
  data: WorkingPermitResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;

  };
}


export type QueryParams = {
  page: number;
  limit: number;
  search?: string;
};


export async function getWorkingPermitService(
  params: QueryParams
): Promise<WPListResponse> {
  const response = await api.get<unknown>(
    "/working-permit/display-working-permit",
    {
      params,
    }
  );

  return wpListResponseSchema.parse(response.data);
}

