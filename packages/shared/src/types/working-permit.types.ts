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
};

// type DepartmentBranchApi = {
//   id: number;
//   entity_name: string;
//   isBranch: boolean;
//   checkerId: number | null;
//   checker: {
//     id: number;
//     name: string;
//     username: string;
//     isActive: boolean;
//   } | null;
// };

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
