import { ref, isRef, watch, Ref, onMounted } from "@vue/composition-api";
import axios, { AxiosResponse, AxiosError } from "axios";
import { isNetworkError } from "./isNetworkError";
import { createCache } from "./cache";

export type QueryStatus = "loading" | "error" | "done";

const cache = createCache();

export function useQuery<
  TRawResponse = object,
  TError = object,
  TResponse = TRawResponse
>({
  url: inputUrl,
  reshaper = data => (data as unknown) as TResponse,
  headers = {}
}: {
  url: string | Ref<string>;
  reshaper: (data: TRawResponse) => TResponse;
  headers?: Record<string, string>;
}) {
  const url = isRef(inputUrl) ? inputUrl : ref(inputUrl);
  const status = ref<QueryStatus>("loading");
  const data = ref<AxiosResponse<TResponse> | undefined>(cache.get(url.value));
  const error = ref<AxiosError<TError> | undefined>(undefined);

  async function makeQuery(onInvalidate?: (cb: () => void) => void) {
    status.value = "loading";
    data.value = cache.get(url.value);
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
      const res = await axios.get(url.value, {
        headers,
        cancelToken: source.token
      });

      const outputData = {
        ...res,
        data: reshaper(res.data)
      };

      data.value = outputData;
      status.value = "done";

      cache.set(url.value, outputData);
    } catch (err) {
      if (!isNetworkError(err)) {
        data.value = undefined;
        cache.delete(url.value);
      }

      status.value = "error";
      error.value = err;
    }

    if (!onInvalidate) {
      return;
    }

    onInvalidate(() => {
      source.cancel();
    });
  }

  watch(url, (_, __, onInvalidate) => makeQuery(onInvalidate));

  onMounted(makeQuery);

  return {
    status,
    data,
    error,
    refetch: makeQuery
  };
}
