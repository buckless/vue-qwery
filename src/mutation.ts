import { ref, Ref } from "@vue/composition-api";
import axios, { AxiosResponse, AxiosError, Method } from "axios";

export type MutationStatus = "idle" | "loading" | "error" | "done";

type UseMutationResult<TBody, TResponse, TError> = [
  (body: TBody) => Promise<AxiosResponse<TResponse>>,
  {
    status: Ref<MutationStatus>;
    data: Ref<AxiosResponse<TResponse> | undefined>;
    error: Ref<AxiosError<TError> | undefined>;
  }
];

export function useMutation<
  TBody,
  TResponse extends object,
  TError = any,
  TRawResponse extends object = any
>({
  url,
  method = "POST",
  reshaper = data => (data as unknown) as TResponse,
  headers = {}
}: {
  url: string;
  method: Method;
  reshaper: (data: TRawResponse) => TResponse;
  headers: Record<string, string>;
}): UseMutationResult<TBody, TResponse, TError> {
  const status = ref<MutationStatus>("idle");
  const data = ref<AxiosResponse<TResponse> | undefined>(undefined);
  const error = ref<AxiosError<TError> | undefined>(undefined);

  async function makeQuery(body: TBody) {
    status.value = "loading";
    let res: AxiosResponse<TRawResponse>;

    try {
      res = await axios(url, {
        data: body,
        method,
        headers
      });

      data.value = {
        ...res,
        data: reshaper(res.data)
      };
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
