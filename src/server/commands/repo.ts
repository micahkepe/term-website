import { Command, CommandResult } from "../mock-server";
import config from "../../../config.json";

export const repoCommand: Command = {
  command: "repo",
  args: [],
  description: "Open project GitHub repo",
  execute: (args?): CommandResult => {
    if (args && args.length > 1) {
      return {
        output:
          "repo: too many arguments passed, expected 0, got " + args.length,
        failed: true,
      };
    }

    window.open(config.author.repo_url, "_blank");
    return { output: "Opening GitHub repo..." };
  },
};
