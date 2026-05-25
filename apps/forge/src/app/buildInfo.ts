const runtimeLoadedAt = new Date();

const viteEnv = import.meta.env as Readonly<
  Partial<{
    VITE_BUILD_TIMESTAMP: string;
    VITE_GIT_COMMIT: string;
    VITE_GIT_STATE: string;
  }>
>;

export const BUILD_INFO = Object.freeze({
  loadedAt: runtimeLoadedAt,
  buildTimestamp: viteEnv.VITE_BUILD_TIMESTAMP ?? "dev",
  commit: viteEnv.VITE_GIT_COMMIT ?? "unknown",
  state: viteEnv.VITE_GIT_STATE ?? "unknown",
});

export function installBuildInfoSurface(document: Document): void {
  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("Missing #app");
  }

  const existing = document.querySelector<HTMLElement>("#build-info");

  if (existing) {
    existing.textContent = buildInfoLabel();
    return;
  }

  const element = document.createElement("div");
  element.id = "build-info";
  element.setAttribute("aria-label", "Build information");
  element.textContent = buildInfoLabel();

  app.append(element);
}

function buildInfoLabel(): string {
  return [
    `loaded ${BUILD_INFO.loadedAt.toLocaleTimeString()}`,
    `build ${BUILD_INFO.buildTimestamp}`,
    BUILD_INFO.commit,
    BUILD_INFO.state,
  ].join(" · ");
}
