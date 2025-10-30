import { type ContentType, type Stream } from "stremio-rewired";

export interface Provider {
  getStreams: (id: string) => Promise<Array<Stream>>;
  search: (
    title: string
  ) => Promise<{ title: string; id: string; imageUrl?: string }[]>;
  getMeta: (
    id: string
  ) => Promise<{ name: string; id: string; type: ContentType }>;
}
