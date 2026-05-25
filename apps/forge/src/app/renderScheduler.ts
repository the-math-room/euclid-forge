export type RequestRender = () => void;

export function createRenderScheduler(render: () => void): RequestRender {
  let renderPending = false;

  return function requestRender(): void {
    if (renderPending) {
      return;
    }

    renderPending = true;

    requestAnimationFrame(() => {
      renderPending = false;
      render();
    });
  };
}
