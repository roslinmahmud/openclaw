import { describe, expect, it } from "vitest";
import { createQaBusState } from "./bus-state.js";
import { runScenarioFlow } from "./scenario-flow-runner.js";

describe("scenario-flow-runner", () => {
  it("supports qaImport inside flow expressions", async () => {
    const result = await runScenarioFlow({
      api: {
        state: createQaBusState(),
        scenario: {
          id: "qa-import",
          title: "qa-import",
          sourcePath: "qa/scenarios/qa-import.md",
          surface: "test",
          objective: "test",
          successCriteria: ["test"],
          execution: { kind: "flow" },
        },
        config: {},
        runScenario: async (
          _name: string,
          steps: Array<{ name: string; run: () => Promise<string | void> }>,
        ) => {
          const stepResults = [];
          for (const step of steps) {
            const details = await step.run();
            stepResults.push({
              name: step.name,
              status: "pass" as const,
              ...(details !== undefined ? { details } : {}),
            });
          }
          return {
            name: "qa-import",
            status: "pass" as const,
            steps: stepResults,
          };
        },
      },
      scenarioTitle: "qa-import",
      flow: {
        steps: [
          {
            name: "uses qaImport",
            actions: [
              {
                set: "basename",
                value: {
                  expr: '(await qaImport("node:path")).basename("/tmp/skill/SKILL.md")',
                },
              },
              {
                assert: {
                  expr: 'basename === "SKILL.md"',
                },
              },
            ],
            detailsExpr: "basename",
          },
        ],
      },
    });

    expect(result).toEqual({
      name: "qa-import",
      status: "pass",
      steps: [
        {
          name: "uses qaImport",
          status: "pass",
          details: "SKILL.md",
        },
      ],
    });
  });

  it("loads bundled QA fixture modules through qaImport", async () => {
    const result = await runScenarioFlow({
      api: {
        state: createQaBusState(),
        scenario: {
          id: "qa-fixture-import",
          title: "qa-fixture-import",
          sourcePath: "qa/scenarios/qa-fixture-import.md",
          surface: "test",
          objective: "test",
          successCriteria: ["test"],
          execution: { kind: "flow" },
        },
        config: {},
        runScenario: async (
          _name: string,
          steps: Array<{ name: string; run: () => Promise<string | void> }>,
        ) => {
          const stepResults = [];
          for (const step of steps) {
            const details = await step.run();
            stepResults.push({
              name: step.name,
              status: "pass" as const,
              ...(details !== undefined ? { details } : {}),
            });
          }
          return {
            name: "qa-fixture-import",
            status: "pass" as const,
            steps: stepResults,
          };
        },
      },
      scenarioTitle: "qa-fixture-import",
      flow: {
        steps: [
          {
            name: "uses bundled fixture qaImport",
            actions: [
              {
                set: "plugin",
                value: {
                  expr: 'await qaImport("./codex-plugin.fixture.js")',
                },
              },
              {
                assert: {
                  expr: 'typeof plugin.createCodexPluginInstallGate === "function"',
                },
              },
            ],
            detailsExpr: '"loaded"',
          },
        ],
      },
    });

    expect(result.status).toBe("pass");
    expect(result.steps[0]?.details).toBe("loaded");
  });
});
