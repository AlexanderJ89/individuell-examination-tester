import "@testing-library/jest-dom";
import { server } from "../mocks/server.js";
import { afterAll, afterEach, beforeAll } from "vitest";

// Starta mock-server en gång innan alla testfiler
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Återställ alla handlers efter varje test för att säkerställa isolering
afterEach(() => server.resetHandlers());

// Stäng servern när alla tester körts
afterAll(() => server.close());
