import { Icon, NifVerificationField } from "@/components";
import { Input } from "@/components/ui/input";
import { AsyncCreatableSelectField } from "@/components/common/input-fetch/async-select";
import { isSelectableClient } from "@/utils";
import type { ContributorVerificationStatus } from "@/types";

const phoneRegex = /^(92|99|91|95|93|94|97)\d{7}$/;

interface CustomerSelectionProps {
    isExpanded: boolean;
    onToggleExpand: () => void;
    selectedClient: any;
    onClientChange: (client: any) => void;
    newCustomerPhone: string;
    onPhoneChange: (phone: string) => void;
    newCustomerName: string;
    onNameChange: (name: string) => void;
    newCustomerTaxNumber: string;
    onTaxNumberChange: (taxNumber: string) => void;
    newCustomerAddress: string;
    onAddressChange: (address: string) => void;
    onVerificationStatusChange: (status: ContributorVerificationStatus) => void;
}

export function CustomerSelection({
    isExpanded,
    onToggleExpand,
    selectedClient,
    onClientChange,
    newCustomerPhone,
    onPhoneChange,
    newCustomerName,
    onNameChange,
    newCustomerTaxNumber,
    onTaxNumberChange,
    newCustomerAddress,
    onAddressChange,
    onVerificationStatusChange,
}: CustomerSelectionProps) {
    const normalizedPhone = newCustomerPhone.replace(/\D/g, "").slice(0, 9);
    const phoneError =
        normalizedPhone.length > 0 && !phoneRegex.test(normalizedPhone)
            ? "Insira um número de telemóvel válido"
            : "";

    return (
        <div className="mb-6 space-y-3" data-tour="pos-customer">
            <button
                onClick={onToggleExpand}
                className="flex items-center justify-between w-full py-2 group hover:text-primary transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Cliente (Opcional)</span>
                </div>
                {isExpanded ? (
                    <Icon
                        name="ChevronDown"
                        size={16}
                        className="text-muted-foreground group-hover:text-primary"
                    />
                ) : (
                    <Icon
                        name="ChevronRight"
                        size={16}
                        className="text-muted-foreground group-hover:text-primary"
                    />
                )}
            </button>

            {isExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Buscar Cliente
                        </label>
                        <AsyncCreatableSelectField
                            endpoint="/clients"
                            optionFilter={isSelectableClient}
                            label=""
                            placeholder="Procurar cliente..."
                            value={selectedClient}
                            onChange={onClientChange}
                            displayFields={["name", "phone"]}
                            minChars={2}
                            formatCreateLabel={(val) => `➕ Criar "${val}"`}
                            virtualKeyboardLayout="default"
                        />
                    </div>

                    {selectedClient?.__isNew__ && (
                        <div
                            className=" gap-4 pt-2 border-t border-dashed space-y-4"
                            data-tour="pos-new-customer-phone"
                        >
                            <NifVerificationField
                                label="NIF do cliente"
                                value={newCustomerTaxNumber}
                                onChange={onTaxNumberChange}
                                onVerified={(contributor) => onNameChange(contributor.name)}
                                onStatusChange={onVerificationStatusChange}
                                allowProceedWithoutVerification
                                proceedWarningMessage="Não foi possível verificar o NIF, pode prosseguir com a criação, porém se o NIF não existir a AGT não validaŕa a factura."
                            />
                            <Input
                                startIcon="Phone"
                                label="Número de Telefone"
                                type="text"
                                inputMode="none"
                                data-layout="numeric"
                                placeholder="Digite o número de telefone..."
                                value={normalizedPhone}
                                onChange={(e) =>
                                    onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 9))
                                }
                                maxLength={9}
                                aria-invalid={!!phoneError}
                                className={phoneError ? "bg-muted/30 border-destructive" : "bg-muted/30"}
                            />
                            {phoneError && (
                                <p className="sm:col-span-2 text-xs text-destructive">{phoneError}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
