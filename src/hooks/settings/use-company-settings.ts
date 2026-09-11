import { settingsService, type UpdateCompanySettingsPayload } from "@/services/settings-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const COMPANY_SETTINGS_KEY = ["company-settings"] as const;

export function useCompanySettings() {
  return useQuery({
    queryKey: COMPANY_SETTINGS_KEY,
    queryFn: () => settingsService.getCompanySettings(),
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCompanySettingsPayload) =>
      settingsService.updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_SETTINGS_KEY });
    },
  });
}

export function getSettingValue(
  settings: { key: string; value: unknown }[] | undefined,
  key: string,
  fallback = "",
): string {
  const setting = settings?.find((item) => item.key === key);
  if (setting?.value == null) return fallback;
  return typeof setting.value === "string"
    ? setting.value
    : String(setting.value);
}
