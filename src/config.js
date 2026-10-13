/**
 * @typedef {"EU" | "US"} Region
 */

const API_URLS = /** @type {const} */ ({
  EU: "https://eu.dust.tt",
  US: "https://dust.tt",
});

const SKILL_AVAILABILITIES = /** @type {const} */ ([
  "editors",
  "workspace_users",
  "users_and_agents",
]);

/**
 * @typedef {(typeof SKILL_AVAILABILITIES)[number]} SkillAvailability
 */

/**
 * @typedef Inputs
 * @property {string} method - The action method to run (e.g. "upsert-skills", "upsert-agent-configs").
 * @property {string} workspaceId - The Dust workspace sId.
 * @property {string} apiKey - The Dust API key.
 * @property {string} apiUrl - The resolved Dust API base URL.
 * @property {string[]} names - Skill names to import.
 * @property {string[]} editors - Editor email addresses to add to imported or updated skills.
 * @property {SkillAvailability | undefined} availability - Availability to apply to imported or updated skills.
 * @property {string} agentConfigs - Comma-separated list of file/folder paths for agent configs.
 */

export default class Config {
  /** @type {Inputs} */
  inputs;

  /** @type {import("@actions/core")} */
  core;

  /**
   * @param {import("@actions/core")} core
   */
  constructor(core) {
    this.core = core;

    const region = core.getInput("region", { required: true }).toUpperCase();
    if (region !== "EU" && region !== "US") {
      throw new Error(`Invalid region "${region}". Must be "EU" or "US".`);
    }

    const availability = core.getInput("availability") || undefined;
    if (
      availability !== undefined &&
      !SKILL_AVAILABILITIES.includes(
        /** @type {SkillAvailability} */ (availability)
      )
    ) {
      throw new Error(
        `Invalid availability "${availability}". Must be one of: ${SKILL_AVAILABILITIES.join(", ")}.`
      );
    }

    this.inputs = {
      method: core.getInput("method", { required: true }),
      workspaceId: core.getInput("workspace-id", { required: true }),
      apiKey: core.getInput("api-key", { required: true }),
      apiUrl: API_URLS[region],
      names: core.getMultilineInput("names").filter(Boolean),
      editors: core.getMultilineInput("editors").filter(Boolean),
      availability: /** @type {SkillAvailability | undefined} */ (availability),
      agentConfigs: core.getInput("agent-configs"),
    };

    core.setSecret(this.inputs.apiKey);
  }
}
