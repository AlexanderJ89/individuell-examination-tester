import { http, HttpResponse } from "msw";

const API_URL =
  "https://731xy9c2ak.execute-api-eu-north-1.amazonaws.com/booking";

export const handlers = [
  http.post(API_URL, async ({ request }) => {
    const mockConfirmation = {
      bookingDetails: {
        bookingId: "SB-TEST-1234",
        when: "2025-12-24T18:00",
        people: 4,
        lanes: 1,
        price: 580,
      },
    };

    return HttpResponse.json(mockConfirmation, { status: 200 });
  }),
];
