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

export type DepartmentBranchApi = {
  id: number;
  entity_name: string;
  isBranch: boolean;
  checkerId: number | null;

  CheckerList: {
    id: number;
    name: string;
  } | null;
};

export type DepartmentBranchesResponse = {
  success: boolean;
  data: DepartmentBranchApi[];
};

export type NextReferenceResponse = {
  success: boolean;
  data: {
    referenceNumber: string;
  };
};