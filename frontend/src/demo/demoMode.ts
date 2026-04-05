const envForcesDemo = import.meta.env.VITE_DEMO_MODE === "true";

export const isPublishedDemoMode =
  envForcesDemo ||
  (typeof window !== "undefined" && window.location.hostname.endsWith("github.io"));
