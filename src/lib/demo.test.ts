import { describe, expect, it } from "vitest";
import { reconnectStatus, resolveVotes } from "./shared";

describe("règles de reprise", () => {
  it("une égalité devient trop vague", () => expect(resolveVotes(["correct", "incorrect"])).toBe("too_vague"));
  it("une reconnexion dépassée expire", () => expect(reconnectStatus("2020-01-01T00:00:00.000Z").expired).toBe(true));
});
