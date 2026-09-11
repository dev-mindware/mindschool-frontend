"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button, Input } from "@/components";
import type { User } from "@/types";
import { ProfileAvatar } from "./profile-avatar";
import { useUpdateUser } from "@/hooks/users";
import { ErrorMessage, getUserRole, SucessMessage } from "@/utils";
import type { UpdateUserProfilePayload } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editProfileSchema,
  EditProfileFormData,
} from "@/schemas/edit-profile-schema";
import { cn } from "@/lib";

export function ProfileForm({ user }: { user: User | null }) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: "onSubmit",
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
    },
  });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateUser();

  const handleProfileSubmit = async (data: EditProfileFormData) => {
    const updateData: UpdateUserProfilePayload = {};

    if (data.name && data.name !== user?.name) updateData.name = data.name;
    if (data.phone && data.phone !== user?.phone) updateData.phone = data.phone;

    if (Object.keys(updateData).length === 0) {
      SucessMessage("Perfil actualizado com sucesso!");
      setIsEditing(false);
      return;
    }

    await updateProfile(updateData, {
      onSuccess: () => {
        SucessMessage("Perfil actualizado com sucesso!");
        setIsEditing(false);
      },
      onError: (error: any) => {
        ErrorMessage(
          error?.response?.data?.message || "Não foi possível actualizar o perfil",
        );
      },
    });
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
      <div className="bg-card rounded-lg border p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <ProfileAvatar userName={user?.name} />
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-lg font-bold">{user?.name}</h3>

            {user?.company?.name && (
              <p className="text-sm text-foreground/80 mt-1">
                {user.company.name}
              </p>
            )}
          </div>

          <Badge variant="default">{getUserRole(user?.role!)}</Badge>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h3 className="font-semibold text-lg">Informação Pessoal</h3>
          <div className="sm:ml-auto flex gap-2">
            <Button
              type="button"
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => {
                if (isEditing) reset();
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </div>
        </div>

        <div
          className={cn("grid grid-cols-1 gap-6 md:grid-cols-2", {
            "pointer-events-none": !isEditing,
          })}
        >
          <Input
            {...register("name")}
            label="Nome"
            className={`bg-background shadow-none`}
            readOnly={!isEditing}
            error={errors.name?.message}
          />
          <Input
            {...register("phone")}
            label="Telefone"
            className={`bg-background shadow-none`}
            readOnly={!isEditing}
            error={errors.phone?.message}
          />
        </div>

        {isEditing && (
          <div className="mt-8 flex justify-end gap-3 border-t pt-6">
            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "A gravar..." : "Guardar Alterações"}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
