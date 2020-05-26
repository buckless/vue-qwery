import { ref, onMounted } from "@vue/composition-api";
import axios, { AxiosResponse, AxiosError } from "axios";
import { createCache } from "./cache";

export type QueryStatus = "loading" | "error" | "done";

const cache = createCache();

export function useQuery<
  TResponse extends object,
  TError = any,
  TRawResponse extends object = any
>({
  url,
  reshaper = data => (data as unknown) as TResponse,
  headers = {}
}: {
  url: string;
  reshaper: (data: TRawResponse) => TResponse;
  headers: Record<string, string>;
}) {
  const status = ref<QueryStatus>("loading");
  const data = ref<AxiosResponse<TResponse> | undefined>(cache.get(url));
  const error = ref<AxiosError<TError> | undefined>(undefined);

  async function makeQuery() {
    status.value = "loading";

    try {
      const res = await axios.get(url, {
        headers
      });

      cache.set(url, data.value);
      data.value = {
        ...res,
        data: reshaper(res.data)
      };
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
