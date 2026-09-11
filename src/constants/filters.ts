export const categoryStatusOptions = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

export const categorySortByOption = [
  { value: "name", label: "Nome" },
  { value: "createdAt", label: "Mais Recente" },
  { value: "updatedAt", label: "Mais Antigo" },
];

export const categorySortOrderOption = [
  { value: "asc", label: "A-Z" },
  { value: "desc", label: "Z-A" },
];


export const itemsStatusOptions = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
  // { value: "OUT_OF_STOCK", label: "Fora do Stock" },
];

export const invoiceStatusOptions = [
  { value: "DRAFT", label: "Pendente" },
  { value: "CANCELLED", label: "Cancelada" },
];

export const itemsByOption = [
  { value: "name", label: "Nome" },
  { value: "sku", label: "SKU" },
  { value: "price", label: "Preço" },
  { value: "createdAt", label: "Mais Recente" },
  { value: "updatedAt", label: "Mais Antigo" },
];

export const usersByOption = [
  { value: "name", label: "Nome" },
  { value: "email", label: "Email" },
  { value: "createdAt", label: "Mais Recente" },
  { value: "updatedAt", label: "Mais Antigo" },
];

export const invoiceByOption = [
  { value: "createdAt", label: "Mais Recente" },
  { value: "dueDate", label: "Mais Antigo" },
  { value: "invoiceNumber", label: "N.º da factura" },
  { value: "clientName", label: "Cliente" },
  { value: "total", label: "Total" },
];

export const itemsOrderOption = [
  { value: "asc", label: "A-Z" },
  { value: "desc", label: "Z-A" },
];
