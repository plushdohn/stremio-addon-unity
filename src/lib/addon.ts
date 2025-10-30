import { createHandler } from "stremio-rewired";
import { AnimeUnityProvider } from "./providers/anime-unity.js";
import { StreamingCommunityProvider } from "./providers/streaming-community.js";

const auProvider = new AnimeUnityProvider();
const scProvider = new StreamingCommunityProvider();

export function createAddonHandler(proxyBase: string) {
  return createHandler({
    manifest: {
      id: "org.stremio.unity",
      version: "0.0.6",
      name: "Unity",
      catalogs: [
        {
          id: "anime-unity",
          type: "series",
          name: "AnimeUnity",
          extra: [
            {
              name: "search",
              isRequired: true,
            },
          ],
        },
        {
          id: "streaming-community",
          type: "movie",
          name: "StreamingCommunity",
          extra: [
            {
              name: "search",
              isRequired: true,
            },
          ],
        },
      ],
      idPrefixes: ["au", "sc"],
      description:
        "Source content and catalogs from AnimeUnity (italian anime streaming website)",
      resources: ["stream", "catalog", "meta"],
      types: ["series", "movie"],
    },
    onCatalogRequest: async (type, id, extra) => {
      if (id === "anime-unity") {
        const records = await auProvider.search(extra?.search || "");
        return {
          metas: records.map((record) => ({
            id: record.id,
            type: "series",
            name: record.title,
            poster: record.imageUrl,
          })),
        };
      }

      if (id === "streaming-community") {
        const records = await scProvider.search(extra?.search || "");
        return {
          metas: records.map((record) => ({
            id: record.id,
            type: "movie",
            name: record.title,
            poster: record.imageUrl,
          })),
        };
      }

      return { metas: [] };
    },
    onMetaRequest: async (type, id) => {
      if (id.startsWith("au")) {
        const idWithoutPrefix = id.replace("au", "");
        const meta = await auProvider.getMeta(idWithoutPrefix);
        return { meta };
      }

      if (id.startsWith("sc")) {
        const idWithoutPrefix = id.replace("sc", "");
        const meta = await scProvider.getMeta(idWithoutPrefix);
        return { meta };
      }

      return { meta: undefined as any };
    },
    onStreamRequest: async (type, id) => {
      if (id.startsWith("au")) {
        const idWithoutPrefix = id.replace("au", "");

        const streams = await auProvider.getStreams(idWithoutPrefix);

        const proxiedStreams = streams.map((stream) => ({
          ...stream,
          url: `${proxyBase}${encodeURIComponent(stream.url)}`,
        }));

        return {
          streams: proxiedStreams,
        };
      } else if (id.startsWith("sc")) {
        const idWithoutPrefix = id.replace("sc", "");

        const streams = await scProvider.getStreams(idWithoutPrefix);

        return { streams };
      }

      return {
        streams: [],
      };
    },
  });
}
