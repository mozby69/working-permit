"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/FieldError";

import {
    createUserSchema,
    updateUserSchema,
    type CreateUserSchema,
    type UpdateUserSchema,
} from "@repo/shared";

import { UserFormProps } from "../../types/access-control.types";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

export function UserForm({
    mode,
    user,
    roles,
    isSubmitting = false,
    onCreate,
    onUpdate,
}: UserFormProps) {
    const isEdit = mode === "edit";

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<CreateUserSchema | UpdateUserSchema>({
        resolver: zodResolver(
            isEdit ? updateUserSchema : createUserSchema
        ),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
            roleIds: [],
            isActive: true,
        },
    });

    useEffect(() => {
        if (isEdit && user) {
            reset({
                name: user.name,
                username: user.username,
                email: user.email ?? "",
                password: "",
                roleIds: user.roles.map((role) => role.id),
                isActive: user.isActive,
            });

            return;
        }

        reset({
            name: "",
            username: "",
            email: "",
            password: "",
            roleIds: [],
        });
    }, [isEdit, user, reset]);

    const submit = (data: CreateUserSchema | UpdateUserSchema) => {
        if (isEdit) {
            onUpdate?.(data as UpdateUserSchema);
            return;
        }

        onCreate?.(data as CreateUserSchema);
    };

    return (
        <form
            id="user-form"
            onSubmit={handleSubmit(submit)}
            className="space-y-4"
        >
            <div>
                <Label htmlFor="name" className="text-black">
                    Name
                </Label>

                <Input
                    type="text"
                    {...register("name")}
                    className="w-full rounded-md border border-black px-3 py-2 text-black"
                />

                <FieldError message={errors.name?.message} />
            </div>

            <div>
                <Label htmlFor="name" className="text-black">
                    Username
                </Label>

                <Input
                    type="text"
                    {...register("username")}
                    className="w-full rounded-md border border-black px-3 py-2 text-black"
                />

                <FieldError message={errors.username?.message} />
            </div>

            <div>
                <Label htmlFor="name" className="text-black">
                    Email
                </Label>

                <Input
                    type="email"
                    {...register("email")}
                    className="w-full rounded-md border border-black px-3 py-2 text-black"
                />

                <FieldError message={errors.email?.message} />
            </div>

            <div>
                <Label htmlFor="password" className="text-black">
                    Password
                </Label>

                <Input
                    type="password"
                    {...register("password")}
                    placeholder={
                        isEdit ? "Leave blank to keep current password" : ""
                    }
                    className="w-full rounded-md border border-black px-3 py-2 text-black"
                />

                <FieldError message={errors.password?.message} />
            </div>

            <div>
                <Label className="text-black">
                    Roles
                </Label>

                <Controller
                    name="roleIds"
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-2">
                            {roles.map((role) => {
                                const checked = field.value?.includes(role.id) ?? false;

                                return (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-2 text-black"
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onChange={(event) => {
                                                const current = field.value ?? [];

                                                if (event.target.checked) {
                                                    field.onChange([
                                                        ...current,
                                                        role.id,
                                                    ]);
                                                } else {
                                                    field.onChange(
                                                        current.filter(
                                                            (id) => id !== role.id
                                                        )
                                                    );
                                                }
                                            }}
                                        />

                                        {role.name}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                />

                <FieldError message={errors.roleIds?.message} />
            </div>

            {isEdit && (
                <label className="flex items-center gap-2 text-black">
                    <Checkbox
                        {...register("isActive")}
                    />

                    Active
                </label>
            )}
        </form>
    );
}