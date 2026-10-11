import { recoveryCodesFile } from "@/components/client/settings/security/recovery-codes-body";
import { groupSecret, onlyDigits } from "@/components/client/settings/security/totp-setup-body";

// os componentes importam o barrel (ícones, botões): aqui só interessam as funções puras
jest.mock("@/components", () => ({ Button: () => null, Icon: () => null }));
jest.mock("qrcode", () => ({ __esModule: true, default: { toCanvas: jest.fn() } }));

describe("configuração do segundo factor", () => {
  it("o código só aceita dígitos e no máximo 6 (cola de «123 456» ou «123-456»)", () => {
    expect(onlyDigits("12a3-4 5 6789")).toBe("123456");
    expect(onlyDigits("")).toBe("");
    expect(onlyDigits("abc")).toBe("");
  });

  it("a chave aparece em grupos de 4, sem alterar o conteúdo", () => {
    expect(groupSecret("ABCDEFGHIJKLMNOP")).toBe("ABCD EFGH IJKL MNOP");
    expect(groupSecret("ABCDEFGHIJ")).toBe("ABCD EFGH IJ");
    expect(groupSecret("ABCD EFGH").replace(/ /g, "")).toBe("ABCDEFGH");
  });

  it("o ficheiro de códigos de recuperação traz um código por linha e o aviso", () => {
    const text = recoveryCodesFile(["aaaa-1111", "bbbb-2222"], new Date("2026-10-11T10:00:00Z"));
    expect(text).toContain("2026-10-11");
    expect(text.split("\n")).toEqual(expect.arrayContaining(["aaaa-1111", "bbbb-2222"]));
    expect(text).toMatch(/uma só vez/);
  });
});
