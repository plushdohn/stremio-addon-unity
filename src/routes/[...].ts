import { defineHandler } from "nitro/h3";
import { createHandler, launch } from "stremio-rewired";
import { AnimeUnityProvider } from "../lib/providers/anime-unity.js";

if (process.env.NODE_ENV === "development") {
  launch(3000);
}

const provider = new AnimeUnityProvider();

const handler = createHandler({
  manifest: {
    id: "org.stremio.unity",
    version: "0.0.2",
    name: "Unity",
    catalogs: [
      {
        id: "unity",
        type: "series",
        name: "AnimeUnity",
        extra: [
          {
            name: "search",
            isRequired: true,
          },
        ],
      },
    ],
    idPrefixes: ["au"],
    description:
      "Source content and catalogs from AnimeUnity (italian anime streaming website)",
    resources: ["stream", "catalog", "meta"],
    types: ["series"],
  },
  onCatalogRequest: async (type, id, search) => {
    const records = await provider.search(search || "");

    return {
      metas: records.map((record) => ({
        id: record.id,
        type: "series",
        name: record.title,
        poster: record.imageUrl,
      })),
    };
  },
  onMetaRequest: async (type, id) => {
    const idWithoutPrefix = id.replace("au", "");

    const meta = await provider.getMeta(idWithoutPrefix);

    return {
      meta,
    };
  },
  onStreamRequest: async (type, id) => {
    const idWithoutPrefix = id.replace("au", "");

    const streams = await provider.getStreams(idWithoutPrefix);

    return {
      streams,
    };
  },
});

export default defineHandler({
  fetch: async (request) => {
    const response = await handler(request);

    if (!response) {
      return new Response("Not found", { status: 404 });
    }

    return response;
  },
});
