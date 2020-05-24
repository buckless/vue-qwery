import { ref } from "@vue/composition-api";
import axios, { AxiosResponse, AxiosError, Method } from "axios";

export type MutationStatus = "idle" | "loading" | "error" | "done";

export function useMutation<TBody, TResponse>(
  url: string,
  method: Method = "POST",
  headers: Record<string, string> = {}
) {
  const status = ref<MutationStatus>("idle");
  const data = ref<AxiosResponse<TResponse | undefined>>(undefined);
  const error = ref<AxiosError<TResponse> | undefined>(undefined);

  async function makeQuery(body: TBody) {
    status.value = "loading";
    let res: AxiosResponse<TResponse>;

    try {
      res = await axios(url, {
        data: body,
        method,
        headers
      });

      data.value = res;
      status.value = "done";
    } catch (err) {
      status.value = "error";
      error.value = err;
      throw err;
    }

    return res;
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
