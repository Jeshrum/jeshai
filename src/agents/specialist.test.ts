import { describe, it, expect } from "vitest";
import { extractHandoff } from "./specialist.js";

describe("step agent handoffs", () => {
  it("extracts the handoff section when present", () => {
    const output = [
      "## Summary",
      "Done.",
      "",
      "## Deliverable",
      "Ready.",
      "",
      "## Handoff",
      "- Use the proposed API shape",
      "- Write tests first",
    ].join("\n");

    expect(extractHandoff(output)).toBe("- Use the proposed API shape\n- Write tests first");
  });

  it("falls back to a trimmed summary when no handoff heading exists", () => {
    expect(extractHandoff("Short output without a section")).toBe("Short output without a section");
  });

  it("ignores earlier file actions when extracting the final handoff", () => {
    const output = [
      "## Summary",
      "Done.",
      "",
      "## Deliverable",
      "Ready.",
      "",
      "## File Actions",
      "<<<WRITE:demo.txt>>>",
      "hello",
      "<<<END_WRITE>>>",
      "",
      "## Handoff",
      "- review demo.txt",
    ].join("\n");

    expect(extractHandoff(output)).toBe("- review demo.txt");
  });
});