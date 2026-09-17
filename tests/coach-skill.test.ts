import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const skillUrl = new URL("../skills/coach/SKILL.md", import.meta.url);
const acceptanceUrl = new URL("../skills/coach/references/behavioral-acceptance.md", import.meta.url);

async function readSkill() {
  return readFile(skillUrl, "utf8");
}

function frontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("SKILL.md must start with YAML frontmatter");
  return match[1];
}

describe("Coach Agent Skill package", () => {
  it("uses the Agent Skills directory/name contract and version metadata", async () => {
    const skill = await readSkill();
    const fm = frontmatter(skill);

    expect(fm).toMatch(/^name: coach$/m);
    expect(fm).toMatch(/^description: .+$/m);
    expect(fm).toMatch(/^compatibility: .+$/m);
    expect(fm).toContain('version: "0.2.0"');
    expect(skill.split("\n").length).toBeLessThan(500);
  });

  it("keeps behavioural guidance separate from server-enforced invariants", async () => {
    const skill = await readSkill();

    expect(skill).toContain("The skill guides cross-tool behaviour");
    expect(skill).toContain("cross-athlete isolation");
    expect(skill).toContain("optimistic version/stale-write conflict handling");
    expect(skill).toContain("idempotency");
    expect(skill).toContain("database relational integrity");
  });

  it("encodes the real-use coaching behaviours that v2 must preserve", async () => {
    const skill = await readSkill();

    expect(skill).toContain("Onboard for coaching sufficiency, not completeness");
    expect(skill).toContain("Read the smallest trusted context needed");
    expect(skill).toContain("Treat availability as opportunity, not quota");
    expect(skill).toContain("Ask only questions that can change the decision");
    expect(skill).toContain("Make persistence visibly useful");
    expect(skill).toContain("Never claim a write succeeded unless the Coach tool reports success");
  });

  it("forbids hidden reasoning capture and trace spam", async () => {
    const skill = await readSkill();

    expect(skill).toContain("Do not store or request chain-of-thought");
    expect(skill).toContain("Routine reads and set logging should not create trace spam");
  });

  it("ships representative behavioural acceptance scenarios", async () => {
    const acceptance = await readFile(acceptanceUrl, "utf8");

    for (const scenario of [
      "Natural onboarding sufficiency",
      "Athlete switching and isolation",
      "Persistence without unnecessary repetition",
      "Context-led weekly planning",
      "Revision and explicit lock",
      "Post-lock adaptation",
      "Evidence uncertainty",
      "Progress credibility",
      "Next-week learning",
      "Failure truthfulness",
      "Interaction economy",
      "Decision trace readiness",
    ]) {
      expect(acceptance).toContain(scenario);
    }
  });
});
