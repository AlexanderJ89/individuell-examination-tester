import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, vi } from "vitest";

import Booking from "./Booking.jsx";
import Confirmation from "./Confirmation.jsx";
// Importera mina hjälpfunktioner från testUtils
import {
  sessionStorageMock,
  bookingDetailsMinimum,
  bookingDetailsComplete,
  ERROR_MESSAGE_MISSING_FIELDS,
  ERROR_MESSAGE_MAX_PLAYERS,
  ERROR_MESSAGE_PEOPLE_SHOES_MISMATCH,
  BOOK_BUTTON_NAME,
  ERROR_MESSAGE_MISSING_SIZE,
} from "../mocks/testUtils.js";

// Valt en integrerad teststrategi eftersom all affärslogik, validering och API-anrop ligger centralt i booking.
// Det garanterar att jag testar hela flödet som en riktigt användare skulle göra.

// Mocka sessionStorage globalt
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

function setupRouter(initialRoute = "/") {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <Booking />,
      },
      {
        path: "/confirmation",
        element: <Confirmation />,
      },
    ],
    {
      initialEntries: [initialRoute],
    }
  );

  // Säkerställa att navigering och session storage rensas efter varje test så inte tester påverkar varandra
  afterEach(() => {
    router.navigate("/");
    sessionStorageMock.setItem.mockClear();
  });

  render(<RouterProvider router={router} />);
  return { user: userEvent.setup(), router };
}

// User Story - 1 Bokning datum, tid och antal spelare/banor
describe("User Story 1: Bokning av datum, tid och antal spelare/banor", () => {
  // Användaren ska kunna välja ett datum och en tid från ett kalender- och tidvalssystem.
  // Användaren ska kunna ange antal spelare (minst 1 spelare).
  // Användaren ska kunna reservera ett eller flera banor beroende på antal spelare.
  it("Should allow user to input booking details correctly", async () => {
    const { user } = setupRouter();

    const dateInput = screen.getByLabelText(/date/i);
    const timeInput = screen.getByLabelText(/time/i);
    const peopleInput = screen.getByLabelText(/awesome bowlers/i);
    const lanesInput = screen.getByLabelText(/lanes/i);

    /*     await user.type(dateInput, "2025-12-24");
    await user.type(timeInput, "18:00"); */

    // Använda fireChange (lägre nivå) för att tvinga in värdet då JSDOM saknar stöd för t.ex. kalenderwidget
    fireEvent.change(dateInput, { target: { value: "2025-12-24" } });
    fireEvent.change(timeInput, { target: { value: "18:00" } });

    await user.clear(peopleInput);
    await user.type(peopleInput, "4");

    await user.clear(lanesInput);
    await user.type(lanesInput, "1");

    // Verifiera minst 1 spelar är möjligt
    await user.clear(peopleInput);
    await user.type(peopleInput, "1");
    expect(peopleInput).toHaveValue(1);

    // Återställer till 4 för att VG-tester
    await user.clear(peopleInput);
    await user.type(peopleInput, "4");
  });
});
