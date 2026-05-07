import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { FALLBACK_MANIFEST } from "./features/audio/modelManifest";

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(FALLBACK_MANIFEST), { status: 200 }),
      ),
    );
  });

  it("renders the live control surface", () => {
    renderApp();

    expect(
      screen.getByRole("heading", { name: "WorldVoice" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    expect(
      screen.getByLabelText("Live sound visualization"),
    ).toBeInTheDocument();
  });

  it("switches presets", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("tab", { name: /choir/i }));

    expect(screen.getByRole("tab", { name: /choir/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
