import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";

export enum ProductMode {
  VIEW,
  NEW,
  EDIT,
}

const autoHideDuration = 3000;
export function successSnackbar(message: string) {
  enqueueSnackbar({ message, variant: "success", autoHideDuration });
}
export function errorSnackbar(message: string) {
  enqueueSnackbar({ message, variant: "error", autoHideDuration });
}

export function getErrorMessage(error: unknown) {
  const err = error as AxiosError;
  if (err.response && "error" in (err.response!.data as any)) {
    return (err.response!.data as any).error;
  } else {
    return (error as AxiosError).message;
  }
}
