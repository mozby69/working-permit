import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workingService } from "../service/working.service";
import { CreateWorkingInput, UpdateWorkingInput } from "@repo/shared";

const queryKey = ["working"] as const;


export function useGetWorking(){
    return useQuery({
        queryKey: [...queryKey],
        queryFn: () => workingService.getAll(),
        select: (response) => response.data,
        staleTime: 60_000,
    });
}

export function useCreateWorking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateWorkingInput) => 
             workingService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey
            })
        }
    })
}

export function useUpdateWorking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload
        }: {
            id: number,
            payload: UpdateWorkingInput
        }) =>
            workingService.update(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey
            });
        },
    });
}