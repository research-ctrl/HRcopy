import { describe, expect, it } from "vitest";
import { LocalTranslationProvider } from "@/lib/providers/local/local-translation-provider";

describe("LocalTranslationProvider", () => {
  it("translates common HR phrasing into Portuguese", async () => {
    const provider = new LocalTranslationProvider();

    const result = await provider.translate({
      text: "Employee must review the probationary contract before termination.",
      targetLanguage: "pt-PT",
    });

    expect(result.text.toLowerCase()).toContain("trabalhador");
    expect(result.text.toLowerCase()).toContain("contrato em periodo experimental");
    expect(result.text.toLowerCase()).toContain("cessacao");
  });

  it("translates common HR phrasing into English", async () => {
    const provider = new LocalTranslationProvider();

    const result = await provider.translate({
      text: "O trabalhador deve rever o contrato em periodo experimental antes da cessacao.",
      targetLanguage: "en-GB",
    });

    expect(result.text.toLowerCase()).toContain("employee");
    expect(result.text.toLowerCase()).toContain("probationary contract");
    expect(result.text.toLowerCase()).toContain("termination");
  });
});
