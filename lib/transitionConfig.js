// Live-tunable settings for the projectMorph transition. Mutated by the
// lil-gui panel in ProjectCoversCanvas and read at trigger time by both the
// canvas (shader expand) and ProjectDetail (page slide-up).
export const projectMorph = {
  shaderDuration: 1.8,
  shaderEase: "power3.inOut",
  wobblePeak: 0.025,
  cornerLead: 0.1,
  twistPeak: 0.05, // radians, peak twist angle during expand
  pageDuration: 1.3,
  pageEase: "power3.inOut",
  overlap: 0.4, // 0..1 — fraction of expand when page starts entering
};

export const EASING_OPTIONS = [
  "power1.in",
  "power1.out",
  "power1.inOut",
  "power2.in",
  "power2.out",
  "power2.inOut",
  "power3.in",
  "power3.out",
  "power3.inOut",
  "power4.in",
  "power4.out",
  "power4.inOut",
  "expo.in",
  "expo.out",
  "expo.inOut",
  "circ.in",
  "circ.out",
  "circ.inOut",
  "sine.in",
  "sine.out",
  "sine.inOut",
  "back.out(1.4)",
  "back.out(2)",
  "elastic.out(1, 0.5)",
];
