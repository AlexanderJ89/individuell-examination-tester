import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, vi } from "vitest";

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

    await user.type(dateInput, "2025-12-24");
    await user.type(timeInput, "18:00");

    await user.clear(peopleInput);
    await user.type(peopleInput, "4");

    await user.clear(lanesInput);
    await user.type(lanesInput, "1");

    // Verifiera minst 1 spelar är möjligt
    await user.clear(peopleInput);
    await user.type(peopleInput, "1");
    expect(peopleInput).toHaveValue(1);

    // Återställer till 4 för VG-tester
    await user.clear(peopleInput);
    await user.type(peopleInput, "4");
  });
});

describe("User Story 1 VG-krav: Validering/felhantering", () => {
  const BOOK_BUTTON = BOOK_BUTTON_NAME;

  // Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas.
  it("Should display an error if date is missing while trying to make a booking", async () => {
    const { user } = setupRouter();

    // Använder min hjälpfunktion bookingDetailsMinimum.
    await bookingDetailsMinimum(user);

    // Tvinga värdet till tom sträng för simulera att datum inte fyllts i.
    // Rensar med clear
    const dateInput = screen.getByLabelText(/date/i);
    await user.clear(dateInput);

    const bookButton = screen.getByRole("button", { name: BOOK_BUTTON });
    await user.click(bookButton);

    // Verifiera felmeddelandet visas
    expect(screen.getByText(ERROR_MESSAGE_MISSING_FIELDS)).toBeInTheDocument();
  });

  it("Should display an error if number of lanes is missing while trying to make a booking", async () => {
    const { user } = setupRouter();

    await bookingDetailsMinimum(user, 4, 1);

    const lanesInput = screen.getByLabelText(/lanes/i);
    await user.clear(lanesInput);

    const bookButton = screen.getByRole("button", { name: BOOK_BUTTON });
    await user.click(bookButton);

    expect(screen.getByText(ERROR_MESSAGE_MISSING_FIELDS)).toBeInTheDocument();
  });

  // Om det inte finns tillräckligt med lediga banor för det angivna antalet spelare, ska användaren få ett felmeddelande.
  it("Should show an error if too many players are booked on lane", async () => {
    const { user } = setupRouter();

    const dateInput = screen.getByLabelText(/date/i);
    const timeInput = screen.getByLabelText(/time/i);
    const peopleInput = screen.getByLabelText(/awesome bowlers/i);
    const lanesInput = screen.getByLabelText(/lanes/i);
    const addShoeButton = screen.getByRole("button", { name: "+" });

    await user.type(dateInput, "2025-12-24");
    await user.type(timeInput, "18:00");
    // Testa med 5 spelare och 1 bana.
    await user.clear(peopleInput);
    await user.type(peopleInput, "5");
    await user.clear(lanesInput);
    await user.type(lanesInput, "1");

    for (let i = 0; i < 5; i++) {
      await user.click(addShoeButton);
    }
    const shoeInputs = screen.getAllByLabelText(/shoe size/i);
    expect(shoeInputs).toHaveLength(5);
    await user.type(shoeInputs[0], "40");
    await user.type(shoeInputs[1], "41");
    await user.type(shoeInputs[2], "42");
    await user.type(shoeInputs[3], "43");
    await user.type(shoeInputs[4], "44");

    const bookButton = screen.getByRole("button", { name: BOOK_BUTTON });
    await user.click(bookButton);

    expect(screen.getByText(ERROR_MESSAGE_MAX_PLAYERS)).toBeInTheDocument();
    // Check för att se till att de följer rätt ordning. Hade lite problem först.
    expect(
      screen.queryByText(/Antalet skor måste stämma överens/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Alla skor måste vara ifyllda/i)
    ).not.toBeInTheDocument();
  });
});

describe("User Story 2: Välja och översikt av skostorlekar", () => {
  // Användaren ska kunna ange skostorlek för varje spelare.
  // Användaren ska kunna ändra skostorlek för varje spelare.
  it("Should allow adding multiple shoes and changing sizes", async () => {
    const { user } = setupRouter();
    const ADD_SHOE_BUTTON = screen.getByRole("button", { name: "+" });

    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);

    let shoeInputs = screen.getAllByLabelText(/shoe size/i);
    expect(shoeInputs).toHaveLength(2);

    await user.type(shoeInputs[0], "38");
    // ändrar skostorleken
    await user.clear(shoeInputs[0]);
    await user.type(shoeInputs[0], "39");
    expect(shoeInputs[0]).toHaveValue("39");
  });

  // Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen.
  // Systemet ska visa en översikt där användaren kan kontrollera de valda skostorlekarna.
  it("Should display correct number of shoe fields while booking 3 people", async () => {
    const { user } = setupRouter();
    const ADD_SHOE_BUTTON = screen.getByRole("button", { name: "+" });

    const peopleInput = screen.getByLabelText(/awesome bowlers/i);

    await user.clear(peopleInput);
    await user.type(peopleInput, "3");

    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);

    const shoeInputs = screen.getAllByLabelText(/shoe size/i);
    expect(shoeInputs).toHaveLength(3);

    await user.type(shoeInputs[0], "40");
    await user.type(shoeInputs[1], "41");
    await user.type(shoeInputs[2], "42");
  });
});

describe("User Story 3: Ta bort skostorleksfält", () => {
  // Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare.
  it("Should remove shoe field and update total number of shoes", async () => {
    const { user } = setupRouter();
    const ADD_SHOE_BUTTON = screen.getByRole("button", { name: "+" });

    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);

    let shoeInputs = screen.getAllByLabelText(/shoe size/i);
    expect(shoeInputs).toHaveLength(3);

    const removeButtons = screen.getAllByRole("button", { name: "-" });

    await user.click(removeButtons[0]);

    shoeInputs = screen.getAllByLabelText(/shoe size/i);
    expect(shoeInputs).toHaveLength(2);
  });
});

describe("User Story 2 VG: Validering av antal skor och ifyllda storlekar", () => {
  const BOOK_BUTTON = BOOK_BUTTON_NAME;
  // Om antalet personer och skor inte matchas ska ett felmeddelande visas.
  // Testar med 4 spelare och 3 skofält.
  it("Should display error if number of shoes doesn't match number of players", async () => {
    const { user } = setupRouter();

    const peopleInput = screen.getByLabelText(/awesome bowlers/i);
    const lanesInput = screen.getByLabelText(/lanes/i);
    const dateInput = screen.getByLabelText(/date/i);
    const timeInput = screen.getByLabelText(/time/i);
    const ADD_SHOE_BUTTON = screen.getByRole("button", { name: "+" });

    await user.type(dateInput, "2025-12-24");
    await user.type(timeInput, "18:00");
    await user.clear(peopleInput);
    await user.type(peopleInput, "4");
    await user.clear(lanesInput);
    await user.type(lanesInput, "1");

    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);

    const shoeInputs = screen.getAllByLabelText(/shoe size/i);
    await user.type(shoeInputs[0], "40");
    await user.type(shoeInputs[1], "41");
    await user.type(shoeInputs[2], "42");

    const bookButton = screen.getByRole("button", { name: BOOK_BUTTON });
    await user.click(bookButton);

    expect(
      screen.getByText(ERROR_MESSAGE_PEOPLE_SHOES_MISMATCH)
    ).toBeInTheDocument();
  });

  // Om användaren försöker slutföra bokningen utan att ange skostorlek för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande och be om att skostorleken anges.
  // Testar med 4 spelare och 4 skofält men en har inte angett storlek.
  it("Should display an error if a shoe size is missing.", async () => {
    const { user } = setupRouter();

    const peopleInput = screen.getByLabelText(/awesome bowlers/i);
    const lanesInput = screen.getByLabelText(/lanes/i);
    const dateInput = screen.getByLabelText(/date/i);
    const timeInput = screen.getByLabelText(/time/i);
    const ADD_SHOE_BUTTON = screen.getByRole("button", { name: "+" });

    await user.type(dateInput, "2025-12-24");
    await user.type(timeInput, "18:00");
    await user.clear(peopleInput);
    await user.type(peopleInput, "4");
    await user.clear(lanesInput);
    await user.type(lanesInput, "1");

    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);
    await user.click(ADD_SHOE_BUTTON);

    const shoeInputs = screen.getAllByLabelText(/shoe size/i);
    await user.type(shoeInputs[0], "40");
    await user.type(shoeInputs[1], "41");
    await user.type(shoeInputs[2], "42");

    const bookButton = screen.getByRole("button", { name: BOOK_BUTTON });
    await user.click(bookButton);

    expect(screen.getByText(ERROR_MESSAGE_MISSING_SIZE)).toBeInTheDocument();
  });
});
