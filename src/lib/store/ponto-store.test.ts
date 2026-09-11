import { describe, expect, it, vi } from "vitest";
import { applyLiveBootstrapState } from "@/lib/store/ponto-store";

const baseState = {
  version: 1 as const,
  profile: null,
  currentGroupId: null,
  groups: [],
  plans: [],
  invitations: [],
  conversations: [],
  messages: [],
  reports: [],
  blocks: [],
  draftSource: "rascunho local",
  parsedDraft: null,
};

const validBootstrap = {
  version: 1 as const,
  profile: null,
  currentGroupId: null,
  groups: [],
  plans: [],
  invitations: [],
  conversations: [],
  messages: [],
  reports: [],
  blocks: [],
  draftSource: "",
  parsedDraft: null,
};

describe("applyLiveBootstrapState", () => {
  it("mantém o estado atual quando o payload é incompleto (ex.: HTML→{})", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const next = applyLiveBootstrapState(baseState, {});
    expect(next).toBeNull();
    expect(baseState.groups.find(() => false)).toBeUndefined();
    errorSpy.mockRestore();
  });

  it("mantém o estado atual quando o payload omite groups", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const withoutGroups = { ...validBootstrap, groups: undefined };
    const next = applyLiveBootstrapState(baseState, withoutGroups);
    expect(next).toBeNull();
    errorSpy.mockRestore();
  });

  it("aplica payload válido e preserva draft local", () => {
    const next = applyLiveBootstrapState(baseState, validBootstrap);
    expect(next).not.toBeNull();
    expect(next?.groups).toEqual([]);
    expect(next?.draftSource).toBe("rascunho local");
    expect(() =>
      next!.groups.find((group) => group.id === next!.currentGroupId),
    ).not.toThrow();
  });
});
