import { customAlphabet } from "nanoid"
import { ALPHABETS } from "../constants/api"

export const generateCustomId = customAlphabet(ALPHABETS, 12)