export type DocumentType =
  | "NIF"
  | "AID"
  | "REF"
  | "RES"
  | "BCER"
  | "PASS"
  | "FID"
  | "ONIF"
  | "OTHR";

export type ContributorStatus = "A" | "C" | "D" | "E" | "F" | "G";

export type ContributorVatRegime =
  | "GNAD"
  | "TRAG"
  | "SIMP"
  | "NBND"
  | "EXCL";

export interface SeticContributor {
  numeroNIF: string;
  nome: string;
  tipoContribuinte: "COLLECTIVE" | "SINGULAR" | string;
  estadoContribuinte: ContributorStatus | string;
  regimeIva: ContributorVatRegime | string;
  indicadorNaoResidente: boolean | string;
}

export interface SeticGetContributorResponse {
  ObterContribuinte: {
    mensagem: string;
    contribuinte: SeticContributor;
  };
}

export interface VerifyContributorInput {
  tipoDocumento: DocumentType;
  numeroDocumento: string;
}

export interface SeticListContributorItem {
  dataOperacao: string;
  numeroNIF: string;
  nomeContribuinte: string;
  estadoContribuinte: ContributorStatus | string;
  tipoContribuinte: "COLLECTIVE" | "SINGULAR" | string;
  operacao: string;
}

export interface SeticListContributorsResponse {
  mensagem: string;
  ListarContribuinte: SeticListContributorItem[];
}

export interface ListContributorsInput {
  dataInicio: string;
  dataFim: string;
}
