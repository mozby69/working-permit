import { useAuth } from "./useAuth";
import { useMutation } from "@tanstack/react-query";
import { loginService } from "../services/auth.service";
import { LoginSchema } from "@repo/shared";





export const useLogin = () => {
    const { login } = useAuth();

    return useMutation({
        mutationFn: (params: LoginSchema) => loginService(params),

        onSuccess: (response) => {
            const user = response.data;

            login(user);
        },
    });
};


