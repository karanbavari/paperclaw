// @vitest-environment node

import { describe, expect, it } from "vitest";
import { deriveCheapProfileState } from "./agent-cheap-profile";

describe("deriveCheapProfileState", () => {
  it("defaults missing cheap profile to disabled", () => {
    expect(deriveCheapProfileState({ runtimeConfig: {} })).toEqual({
      enabled: false,
      model: "",
    });
  });

  it("requires explicit enabled true to turn the cheap profile on", () => {
    expect(
      deriveCheapProfileState({
        runtimeConfig: {
          modelProfiles: {
            cheap: {
              adapterConfig: { model: "small-model" },
            },
          },
        },
      }),
    ).toEqual({
      enabled: false,
      model: "small-model",
    });
  });

  it("preserves explicit enabled false", () => {
    expect(
      deriveCheapProfileState({
        runtimeConfig: {
          modelProfiles: {
            cheap: {
              enabled: false,
              adapterConfig: { model: "small-model" },
            },
          },
        },
      }),
    ).toEqual({
      enabled: false,
      model: "small-model",
    });
  });

  it("allows overlay changes to control enabled state and model", () => {
    expect(
      deriveCheapProfileState({
        runtimeConfig: {
          modelProfiles: {
            cheap: {
              enabled: false,
              adapterConfig: { model: "old-small-model" },
            },
          },
        },
        overlay: {
          enabled: true,
          adapterConfig: { model: "new-small-model" },
        },
      }),
    ).toEqual({
      enabled: true,
      model: "new-small-model",
    });
  });
});
