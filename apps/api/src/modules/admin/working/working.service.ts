import { CreateWorkingInput, UpdateWorkingInput } from "@repo/shared";
import { createWorkingRepo, findWorkingById, findWorkingByWorkerNameRepo, getAllWorkingRepo, updateWorkingRepo } from "./working.repository";


export async function getAllWorkingService() {
    return getAllWorkingRepo();
}

export async function createWorkingService(data: CreateWorkingInput) {
     
    const name  = data.workerName.trim();

    const existing = await findWorkingByWorkerNameRepo(name);

    if(existing){
        throw new Error(
            "Working already exists"
        );
    }

    return createWorkingRepo({
        ...data,
        workerName: name,
    });

}

export async function updateWorkingService(
    id: number,
    data: UpdateWorkingInput
) {

    const existing = await findWorkingById(id);

    if(!existing){
        throw new Error(
            "Working not found"
        );
    } 

    const name = data.workerName?.trim() ?? existing.workerName;

    const duplicate  = await findWorkingByWorkerNameRepo(name);

    if(duplicate && duplicate.id !== id) {
          throw new Error(
            "Working already exists"
        );
    }

    return updateWorkingRepo(id, data);
    
}


