import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Skapar MSW serverinstans med definierade mock-handlers
export const server = setupServer(...handlers);
