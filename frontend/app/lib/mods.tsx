export type Mod = {
  acronym: string;
  rulesets: number[];
  name: string;
};

export const Mods: { name: string; color: string; types: Mod[] }[] = [
  {
    name: "Reduction",
    color: "text-mod-decrease",
    types: [
      { acronym: "EZ", rulesets: [0, 1, 2, 3], name: "Easy" },
      { acronym: "NF", rulesets: [0, 1, 2, 3], name: "No Fail" },
      { acronym: "HT", rulesets: [0, 1, 2, 3], name: "Half Time" },
      { acronym: "DC", rulesets: [0, 1, 2, 3], name: "Daycore" },
      { acronym: "SR", rulesets: [1], name: "Simplified Rhythm (taiko)" },
      { acronym: "NR", rulesets: [3], name: "No Release (mania)" },
    ],
  },
  {
    name: "Increase",
    color: "text-mod-increase",
    types: [
      { acronym: "HR", rulesets: [0, 1, 2, 3], name: "Hard Rock" },
      { acronym: "SD", rulesets: [0, 1, 2, 3], name: "Sudden Death" },
      { acronym: "PF", rulesets: [0, 1, 2, 3], name: "Perfect" },
      { acronym: "DT", rulesets: [0, 1, 2, 3], name: "Double Time" },
      { acronym: "NC", rulesets: [0, 1, 2, 3], name: "Nightcore" },
      { acronym: "HD", rulesets: [0, 1, 2, 3], name: "Hidden" },
      { acronym: "FL", rulesets: [0, 1, 2, 3], name: "Flashlight" },
      { acronym: "AC", rulesets: [0, 1, 2, 3], name: "Accuracy Challenge" },
      { acronym: "TC", rulesets: [0], name: "Traceable (osu!)" },
      { acronym: "BL", rulesets: [0], name: "Blinds (osu!)" },
      { acronym: "ST", rulesets: [0], name: "Strict Tracking (osu!)" },
      { acronym: "FI", rulesets: [3], name: "Fade In (mania)" },
      { acronym: "CO", rulesets: [3], name: "Cover (mania)" },
    ],
  },
  {
    name: "Automation",
    color: "text-mod-automation",
    types: [
      {
        acronym: "RX",
        rulesets: [0, 1, 2],
        name: "Relax (osu!, taiko, catch)",
      },
      { acronym: "AP", rulesets: [0], name: "Autopilot (osu!)" },
      { acronym: "SO", rulesets: [0], name: "Spun Out (osu!)" },
    ],
  },
  {
    name: "Conversion",
    color: "text-mod-conversion",
    types: [
      { acronym: "DA", rulesets: [0, 1, 2, 3], name: "Difficulty Adjust" },
      { acronym: "CL", rulesets: [0, 1, 2, 3], name: "Classic" },
      {
        acronym: "RD",
        rulesets: [0, 1, 3],
        name: "Random (osu!, taiko, mania)",
      },
      {
        acronym: "MR",
        rulesets: [0, 2, 3],
        name: "Mirror (osu!, catch, mania)",
      },
      { acronym: "SG", rulesets: [0, 1], name: "Single Tap (osu!, taiko)" },
      {
        acronym: "CS",
        rulesets: [1, 3],
        name: "Constant Speed (taiko, mania)",
      },
      { acronym: "TP", rulesets: [0], name: "Target Practice (osu!)" },
      { acronym: "AL", rulesets: [0], name: "Alternate (osu!)" },
      { acronym: "SW", rulesets: [1], name: "Swap (taiko)" },
    ],
  },
  {
    name: "Fun",
    color: "text-mod-fun",
    types: [
      { acronym: "WU", rulesets: [0, 1, 2, 3], name: "Wind Up" },
      { acronym: "WD", rulesets: [0, 1, 2, 3], name: "Wind Down" },
      { acronym: "MU", rulesets: [0, 1, 2, 3], name: "Muted" },
      {
        acronym: "AS",
        rulesets: [0, 1, 3],
        name: "Adaptive Speed (osu!, taiko, mania)",
      },
      { acronym: "NS", rulesets: [0, 2], name: "No Scope (osu!, catch)" },
      { acronym: "SY", rulesets: [0, 2], name: "Synesthesia (osu!, catch)" },
      { acronym: "TF", rulesets: [0], name: "Transform (osu!)" },
      { acronym: "WG", rulesets: [0], name: "Wiggle (osu!)" },
      { acronym: "SI", rulesets: [0], name: "Spin In (osu!)" },
      { acronym: "GR", rulesets: [0], name: "Grow (osu!)" },
      { acronym: "DF", rulesets: [0], name: "Deflate (osu!)" },
      { acronym: "BR", rulesets: [0], name: "Barrel Roll (osu!)" },
      { acronym: "AD", rulesets: [0], name: "Approach Different (osu!)" },
      { acronym: "MG", rulesets: [0], name: "Magnetised (osu!)" },
      { acronym: "RP", rulesets: [0], name: "Repel (osu!)" },
      { acronym: "FR", rulesets: [0], name: "Freeze Frame (osu!)" },
      { acronym: "BU", rulesets: [0], name: "Bubbles (osu!)" },
      { acronym: "DP", rulesets: [0], name: "Depth (osu!)" },
      { acronym: "BM", rulesets: [0], name: "Bloom (osu!)" },
      { acronym: "FF", rulesets: [2], name: "Floating Fruits (catch)" },
      { acronym: "MF", rulesets: [2], name: "Moving Fast (catch)" },
    ],
  },
  {
    name: "Other",
    color: "text-mod-other",
    types: [
      { acronym: "TD", rulesets: [0], name: "Touch Device (osu!)" },
      { acronym: "1K", rulesets: [3], name: "1 Key (mania)" },
      { acronym: "2K", rulesets: [3], name: "2 Keys (mania)" },
      { acronym: "3K", rulesets: [3], name: "3 Keys (mania)" },
      { acronym: "4K", rulesets: [3], name: "4 Keys (mania)" },
      { acronym: "5K", rulesets: [3], name: "5 Keys (mania)" },
      { acronym: "6K", rulesets: [3], name: "6 Keys (mania)" },
      { acronym: "7K", rulesets: [3], name: "7 Keys (mania)" },
      { acronym: "8K", rulesets: [3], name: "8 Keys (mania)" },
      { acronym: "9K", rulesets: [3], name: "9 Keys (mania)" },
      { acronym: "10K", rulesets: [3], name: "10 Keys (mania)" },
    ],
  },
];
