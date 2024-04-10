import { config } from "dotenv";
config()

export const HOST_DOMAIN = process.env.HOST_DOMAIN || "localhost:3000";
export const DATA_DIR = process.env.DATA_DIR || "data/";

export const PINS_DIR = DATA_DIR + "pins/";
export const UPLOADS_DIR = DATA_DIR + "uploads";
export const PUBLIC_UPLOADS_PATH = "/uploads/";
