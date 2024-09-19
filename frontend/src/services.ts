import { ApiClient } from "@backend/client";
import axios from "axios";

// TODO: use env variable
const client = axios.create({
  baseURL: "http://localhost:3024/api",
});

export const API = new ApiClient(client);
