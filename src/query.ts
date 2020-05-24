import { ref, onMounted } from "@vue/composition-api";
import axios, { AxiosResponse, AxiosError } from "axios";
import { createCache } from "./cache";

export type QueryStatus = "loading" | "error" | "done";

const cache = createCache();

export function useQuery<TBody>(
  url: string,
  headers: Record<string, string> = {}
) {
  const status = ref<QueryStatus>("loading");
  const data = ref<AxiosResponse<TBody> | undefined>(cache.get(url));
  const error = ref<AxiosError<TBody> | undefined>(undefined);

  async function makeQuery() {
    status.value = "loading";

    try {
      const res = await axios.get(url, {
        headers
      });

      cache.set(url, data.value);
      data.value = res;
      status.value = "done";
    } catch (err) {
      status.value = "error";
      error.value = err;
    }
  }

  onMounted(makeQuery);

  return {
    status,
    data,
    error,
    refetch: makeQuery
  };
}
