import { CreateDepartmentBranchInput, UpdateDepartmentBranchInput } from "@repo/shared";
import { createDepartmentBranchRepo, deleteDepartmentBranchRepo, findDepartmentBranchById, findDepartmentBranchByName, getAllDepartmentBranches, updateDepartmentBranchRepo } from "./branch.repository";


export async function getDepartmentBranchesService(
  isBranch?: boolean
) {
  return getAllDepartmentBranches({ isBranch });
}

export  async function createDepartmentBranchService(
    data: CreateDepartmentBranchInput
) {
    const name = data.entityName.trim();
    const isBranch = data.isBranch ?? true;

    const existing = await findDepartmentBranchByName(
        name,
        isBranch
    );

    if(existing){
        throw new Error(
            "Branch or Department already exists"
        );
    }

    return createDepartmentBranchRepo({
        ...data,
        entityName: name,
        isBranch
    });
}


export async function updateDepartmentBranchService(
    id: number,
    data: UpdateDepartmentBranchInput
) {

    const existing = await findDepartmentBranchById(id);

    if(!existing){
        throw new Error(
            "Branch or department not found"
        );
    }

    const name = data.entityName?.trim() ?? existing.entityName;
    const isBranch = data.isBranch ?? existing.isBranch;

    
    const duplicate = await findDepartmentBranchByName(
        name,
        isBranch
    );

    if(duplicate && duplicate.id !== id){
        throw new Error(
            "Branch or department already exists"
        );
    }

    return updateDepartmentBranchRepo(id, data);

}


export async function deleteDepartmentBranchService(id: number) {
    const existing = await findDepartmentBranchById(id);

    if(!existing){
        throw new Error(
            "Branch or department not found"
        );
    }

    return deleteDepartmentBranchRepo(id);
    
}