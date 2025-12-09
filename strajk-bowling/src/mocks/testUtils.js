import { fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// Global konstanter för att undvika skriva dessa i varje test
export const ERROR_MESSAGE_MISSING_FIELDS = "Alla fälten måste vara ifyllda";
export const ERROR_MESSAGE_MAX_PLAYERS = "Det får vara max 4 spelare per bana";
export const ERROR_MESSAGE_PEOPLE_SHOES_MISMATCH =
  "Antalet skor måste stämma överens med antal spelare";
export const ERROR_MESSAGE_MISSING_SIZE = "Alla skor måste vara ifyllda";
export const BOOK_BUTTON_NAME = "strIIIIIike!";

// Mockar sessionStorage för att kontrollera vad som sparas/läses under testkörningen (User Story 5)
export const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

// Hjälpfunktion för fylla i grundläggande bokningsdetaljer och undvika upprepa min kod i varje testfall
export async function bookingDetailsMinimum(user, players = 4, lanes = 1) {
  const dateInput = screen.getByLabelText(/date/i);
  const timeInput = screen.getByLabelText(/time/i);
  const peopleInput = screen.getByLabelText(/awesome bowlers/i);
  const lanesInput = screen.getByLabelText(/lanes/i);

  /*  await user.type(dateInput, "2025-12-24");
  await user.type(timeInput, "18:00"); */
  fireEvent.change(dateInput, { target: { value: "2025-12-24" } });
  fireEvent.change(timeInput, { target: { value: "18:00" } });

  await user.clear(peopleInput);
  if (players !== 0) await user.type(peopleInput, String(players));
  await user.clear(lanesInput);
  if (lanes !== 0) await user.type(lanesInput, String(lanes));
}

// Hjälpfunktion för fylla i detaljer för komplett bokning
export async function bookingDetailsComplete(user) {
  const peopleInput = screen.getByLabelText(/awesome bowlers/i);
  const lanesInput = screen.getByLabelText(/lanes/i);
  const addShoeButton = screen.getByRole("button", { name: "+" });

  await user.type(screen.getByLabelText(/date/i), "2025-12-24");
  await user.type(screen.getByLabelText(/time/i), "18:00");
  await user.clear(peopleInput);
  await user.type(peopleInput, "4");
  await user.clear(lanesInput);
  await user.type(lanesInput, "1");

  for (let i = 0; i < 4; i++) {
    await user.click(addShoeButton);
  }

  const shoeInputs = screen.getAllByLabelText(/shoe size/i);

  await waitFor(() => {
    expect(shoeInputs).toHaveLength(4);
  });

  await user.type(shoeInputs[0], "40");
  await user.type(shoeInputs[1], "41");
  await user.type(shoeInputs[2], "42");
  await user.type(shoeInputs[3], "43");
}
