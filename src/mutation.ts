import { ref, Ref, isRef } from "@vue/composition-api";
import axios, { AxiosResponse, AxiosError, Method } from "axios";

export type MutationStatus = "idle" | "loading" | "error" | "done";

type UseMutationResult<TBody, TResponse, TError> = [
  (
    body: TBody,
    onInvalidate: (cb: () => void) => void
  ) => Promise<AxiosResponse<TResponse>>,
  {
    status: Ref<MutationStatus>;
    data: Ref<AxiosResponse<TResponse> | undefined>;
    error: Ref<AxiosError<TError> | undefined>;
  }
];

export function useMutation<
  TBody,
  TRawResponse = object,
  TError = object,
  TResponse = TRawResponse
>({
  url: inputUrl,
  method = "POST",
  reshaper = data => (data as unknown) as TResponse,
  headers = {}
}: {
  url: string | Ref<string>;
  method?: Method;
  reshaper: (data: TRawResponse) => TResponse;
  headers?: Record<string, string>;
}): UseMutationResult<TBody, TResponse, TError> {
  const url = isRef(inputUrl) ? inputUrl : ref(inputUrl);
  const status = ref<MutationStatus>("idle");
  const data = ref<AxiosResponse<TResponse> | undefined>(undefined);
  const error = ref<AxiosError<TError> | undefined>(undefined);

  async function makeQuery(body: TBody) {
    status.value = "loading";

    let res: AxiosResponse<TRawResponse>;

    try {
      res = await axios(url.value, {
        data: body,
        method,
        headers
      });

      const outputData = {
        ...res,
        data: reshaper(res.data)
      };

      data.value = outputData;
      status.value = "done";
    } catch (err) {
      status.value = "error";
      error.value = err;
      throw err;
    }

    return data.value;
  }

  return [
    makeQuery,
    {
      status,
      data,
      error
    }
  ];
}
