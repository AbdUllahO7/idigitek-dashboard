
import { Language } from "@/src/api/types/hooks/language.types";

// /**
//  * Creates a mapping of language IDs to language codes
//  * 
//  * @param activeLanguages - Array of language objects
//  * @returns A record mapping language IDs to language codes
//  */
export const createLanguageCodeMap = (activeLanguages: Language[]): Record<string, string> => {
  return activeLanguages.reduce<Record<string, string>>((acc, lang) => {
    acc[lang._id] = lang.languageID;
    return acc;
  }, {});
};

// /**
//  * Maps a language ID to its corresponding language code
//  * 
//  * @param langId - The language ID to map
//  * @param activeLanguages - Array of language objects
//  * @returns The corresponding language code or the original ID if not found
//  */
// export const mapLanguageIdToCode = (langId: string, activeLanguages: Language[]): string => {
//   const codeMap = createLanguageCodeMap(activeLanguages);
//   return codeMap[langId] || langId;
// };

// /**
//  * Applies a function to each language ID, replacing it with its language code
//  * 
//  * @param languageIds - Array of language IDs
//  * @param activeLanguages - Array of language objects
//  * @param callback - Function to call for each language code
//  * @returns Record mapping language codes to the return values of the callback
//  */
// export const forEachLanguageCode = <T>(
//   languageIds: string[],
//   activeLanguages: Language[],
//   callback: (langCode: string) => T
// ): Record<string, T> => {
//   const result: Record<string, T> = {};
//   const languageCodeMap = createLanguageCodeMap(activeLanguages);
  
//   languageIds.forEach((langId) => {
//     const langCode = languageCodeMap[langId] || langId;
//     result[langCode] = callback(langCode);
//   });
  
//   return result;
// };