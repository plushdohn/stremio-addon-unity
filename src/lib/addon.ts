import { createHandler } from "stremio-rewired";
import { AnimeUnityProvider } from "./providers/anime-unity.js";

const provider = new AnimeUnityProvider();

export function createAddonHandler(proxyBase: string) {
  return createHandler({
    manifest: {
      id: "org.stremio.unity",
      version: "0.0.3",
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
    onCatalogRequest: async (type, id, extra) => {
      const records = await provider.search(extra?.search || "");

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

      const proxiedStreams = streams.map((stream) => ({
        ...stream,
        url: `${proxyBase}${encodeURIComponent(stream.url)}`,
      }));

      return {
        streams: proxiedStreams,
      };
    },
  });
}
