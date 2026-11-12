export type DepartmentBranch = {
  id: number;
  entityName: string;
  isBranch: boolean;
  checkerId: number | null;
  checker: {
    id: number;
    name: string;
    username: string;
    isActive: boolean;
  } | null;
  createdAt: string;
};



export type DepartmentBranchesResponse = {
  success: boolean;
  data: DepartmentBranch[];
};

export type NextReferenceResponse = {
  success: boolean;
  data: {
    referenceNumber: string;
  };
};


export type QueryParams = {
  page: number;
  limit: number;
  search?: string;
};
