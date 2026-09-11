"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { File as MyFile } from "@/types";
import { api } from "@/services/api";

type UploadFile = MyFile | null | undefined;

type UploadData = Record<
  string,
  string | number | boolean | MyFile | MyFile[] | null
>;

interface MutationVariables {
  files: Record<string, UploadFile | UploadFile[]>; // aceita array também
  extraData?: UploadData;
}

export type UploadMethod = "POST" | "PUT" | "PATCH";

interface UseFileUploadOptions {
  apiEndpoint: string;
  queryKey?: string;
  method?: UploadMethod; // opcional, default POST
}

export function useFileUpload(apiEndpoint: string, queryKey?: string, method?: UploadMethod) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ files, extraData = {} }: MutationVariables) => {
      const formData = new FormData();

      // Percorre os ficheiros.
      for (const [key, value] of Object.entries(files)) {
        if (!value) continue;

        if (Array.isArray(value)) {
          for (const file of value) {
            if (!file?.url) continue;
            const response = await fetch(file.url);
            const blob = await response.blob();
            const fileObject = new File([blob], file.originalname, { type: file.mimetype });
            formData.append(key, fileObject);
          }
        } else {
          if (!value?.url) continue;
          const response = await fetch(value.url);
          const blob = await response.blob();
          const fileObject = new File([blob], value.originalname, { type: value.mimetype });
          formData.append(key, fileObject);
        }
      }

      for (const [key, value] of Object.entries(extraData)) {
        if (value !== null && typeof value !== "object") {
          formData.append(key, value.toString());
        }
      }

      let response;
      switch (method) {
        case "POST":
          response = await api.post(apiEndpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          break;
        case "PUT":
          response = await api.put(apiEndpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          break;
        case "PATCH":
          response = await api.patch(apiEndpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          break;
      }

      return { data: response?.data };
    },
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey: ["user", queryKey] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
    onError: (error: any) => {
      console.error("Erro no upload:", error);
    },
  });

  return { ...mutation };
}
