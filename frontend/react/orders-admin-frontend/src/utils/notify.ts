// src/utils/notify.ts
import { enqueueSnackbar } from "notistack";

export const notifySuccess = (msg: string) => enqueueSnackbar(msg, { variant: "success" });
export const notifyError = (msg: string) => enqueueSnackbar(msg, { variant: "error" });
export const notifyInfo = (msg: string) => enqueueSnackbar(msg, { variant: "info" });
