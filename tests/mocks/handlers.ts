import { http, HttpResponse } from "msw";

const API = "http://localhost:8080/api/v1";

export const handlers = [
  http.get(`${API}/healthz`, () => HttpResponse.json({ status: "ok" })),

  http.get(`${API}/assets`, () =>
    HttpResponse.json({
      data: [
        { id: "model-1", name: "Sony A7 IV", categoryName: "Cameras", unitCount: 3, availableCount: 2 },
        { id: "model-2", name: "DJI Ronin RS3", categoryName: "Gimbals", unitCount: 1, availableCount: 0 },
      ],
      pagination: { nextCursor: null, hasMore: false },
    }),
  ),

  http.get(`${API}/assets/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      name: "Sony A7 IV",
      description: "Full-frame mirrorless",
      tags: ["camera", "mirrorless"],
      photos: [],
      units: [
        { id: "u1", modelId: params.id, publicId: "ABCDEFGH1234", serialNumber: "SN-001", assetTag: "MGM-CAM-001", status: "available", condition: "good", location: { room: "F10.5" } },
      ],
    }),
  ),

  http.get(`${API}/public/assets/:publicId`, ({ params }) => {
    if (params.publicId === "MISSING") return HttpResponse.json({ error: { code: "RESOURCE_NOT_FOUND" } }, { status: 404 });
    return HttpResponse.json({
      publicId: params.publicId,
      modelName: "Sony A7 IV",
      modelDescription: "Full-frame mirrorless camera.",
      categoryName: "Cameras",
      tags: ["camera"],
      unitStatus: "available",
      gallery: [],
    });
  }),

  http.get(`${API}/categories`, () => HttpResponse.json({ data: [{ id: "cat-1", slug: "cameras", name: "Cameras" }] })),
  http.get(`${API}/categories/:id/custom-fields`, () => HttpResponse.json({ data: [] })),
  http.get(`${API}/tags`, () => HttpResponse.json({ data: [{ id: "t1", slug: "camera", name: "camera" }] })),

  http.get(`${API}/notifications`, () =>
    HttpResponse.json({ data: [], pagination: { nextCursor: null, hasMore: false } }),
  ),

  http.get(`${API}/borrow-requests`, () =>
    HttpResponse.json({ data: [], pagination: { nextCursor: null, hasMore: false, total: 0 } }),
  ),
  http.get(`${API}/procurement-requests`, () =>
    HttpResponse.json({ data: [], pagination: { nextCursor: null, hasMore: false, total: 0 } }),
  ),
  http.get(`${API}/infra-requests`, () =>
    HttpResponse.json({ data: [], pagination: { nextCursor: null, hasMore: false, total: 0 } }),
  ),
  http.get(`${API}/room-bookings`, () =>
    HttpResponse.json({ data: [], pagination: { nextCursor: null, hasMore: false, total: 0 } }),
  ),
  http.get(`${API}/license-requests`, () =>
    HttpResponse.json({ data: [], pagination: { nextCursor: null, hasMore: false, total: 0 } }),
  ),
  http.get(`${API}/general-requests`, () =>
    HttpResponse.json({ data: [], pagination: { nextCursor: null, hasMore: false, total: 0 } }),
  ),

  http.get(`${API}/rooms`, () =>
    HttpResponse.json({ data: [{ id: "r1", name: "F10.5", capacity: 10 }, { id: "r2", name: "F10.6", capacity: 6 }] }),
  ),
  http.get(`${API}/rooms/:id/availability`, ({ params, request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? "2026-06-02";
    return HttpResponse.json({
      date,
      roomId: params.id,
      openHour: 6,
      closeHour: 22,
      bufferMinutes: 10,
      slots: [],
    });
  }),
];
