import { ref, isRef, watchEffect, Ref } from "@vue/composition-api";
import axios, { AxiosResponse, AxiosError } from "axios";
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

  async function makeQuery(onInvalidate: (cb: () => void) => void) {
    status.value = "loading";
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
      status.value = "error";
      error.value = err;
    }

    onInvalidate(() => {
      source.cancel();
    });
  }

  watchEffect(makeQuery);

  return {
    status,
    data,
    error,
    refetch: makeQuery
  };
}
