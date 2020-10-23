import { AxiosError } from "axios";

export const isNetworkError = (err: AxiosError) => !err.response?.status;
