import { createdAtFromUuidV7 } from "@/lib/uuid7";

describe("createdAtFromUuidV7", () => {
  it("lê o instante dos 48 bits iniciais", () => {
    // 0x01a16f84a90a = 1_792_000_000_000 ms (aprox.)
    const id = "01a16f84-a90a-7529-8baf-398c1f44b8d2";
    const iso = createdAtFromUuidV7(id);
    expect(iso).toMatch(/^2026-/);
    expect(new Date(iso).getTime()).toBe(parseInt("01a16f84a90a", 16));
  });
  it("devolve vazio para ids que não são UUIDv7", () => {
    expect(createdAtFromUuidV7("")).toBe("");
    expect(createdAtFromUuidV7("123")).toBe("");
    expect(createdAtFromUuidV7("550e8400-e29b-41d4-a716-446655440000")).toBe("");
  });
});
