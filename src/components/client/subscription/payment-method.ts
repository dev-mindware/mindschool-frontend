import { MethodName, Method } from "@/types";

type MyMethod = Record<MethodName, Method>;

export const paymentMethods: MyMethod = {
   "Kwik": {
    name: "Kwik",
    icon: "kwik.png",
    description: "Pagamento via Kwik",
    info: "Efetue a transferência para o IBAN indicado abaixo. O pagamento é verificado instantaneamente pela nossa equipa.",
    processingTime: "Instantâneo",
    reference: "AO06.0005.0000.0933.1805.1011.5",
    owner: "MINDWARE COMERCIO E SERVICOS LDA",
  },
  "Express": {
    name: "Express",
    icon: "express.png",
    description: "Pagamento instantâneo",
    info: "Efetue a transferência para o IBAN indicado abaixo. O pagamento é verificado instantaneamente.",
    processingTime: "Instantâneo",
    reference: "AO06.0005.0000.0933.1805.1011.5",
    owner: "MINDWARE COMERCIO E SERVICOS LDA",
  },
};