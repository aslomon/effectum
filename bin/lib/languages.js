/**
 * Extended language definitions for the Effectum CLI.
 * Supports 15+ languages plus custom instructions.
 */
"use strict";

/** @type {Array<{ value: string, label: string, hint: string }>} */
const LANGUAGE_CHOICES = [
  { value: "english", label: "English", hint: "English" },
  { value: "german", label: "Deutsch", hint: "German (du/informal)" },
  { value: "french", label: "Fran\u00e7ais", hint: "French" },
  { value: "spanish", label: "Espa\u00f1ol", hint: "Spanish" },
  { value: "italian", label: "Italiano", hint: "Italian" },
  { value: "portuguese", label: "Portugu\u00eas", hint: "Portuguese" },
  { value: "dutch", label: "Nederlands", hint: "Dutch" },
  { value: "polish", label: "Polski", hint: "Polish" },
  { value: "turkish", label: "T\u00fcrk\u00e7e", hint: "Turkish" },
  {
    value: "arabic",
    label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    hint: "Arabic",
  },
  {
    value: "hindi",
    label: "\u0939\u093f\u0928\u094d\u0926\u0940",
    hint: "Hindi",
  },
  { value: "chinese", label: "\u4e2d\u6587", hint: "Chinese (Simplified)" },
  { value: "japanese", label: "\u65e5\u672c\u8a9e", hint: "Japanese" },
  { value: "korean", label: "\ud55c\uad6d\uc5b4", hint: "Korean" },
  {
    value: "russian",
    label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
    hint: "Russian",
  },
  {
    value: "custom",
    label: "Custom",
    hint: "Enter your own language instruction",
  },
];

/** @type {Record<string, string>} */
const LANGUAGE_INSTRUCTIONS = {
  english:
    "Speak English with the user. All code, comments, commits, and docs in English.",
  german:
    "Speak German (du/informal) with the user. All code, comments, commits, and docs in English.",
  french:
    "Speak French with the user. All code, comments, commits, and docs in English.",
  spanish:
    "Speak Spanish with the user. All code, comments, commits, and docs in English.",
  italian:
    "Speak Italian with the user. All code, comments, commits, and docs in English.",
  portuguese:
    "Speak Portuguese with the user. All code, comments, commits, and docs in English.",
  dutch:
    "Speak Dutch with the user. All code, comments, commits, and docs in English.",
  polish:
    "Speak Polish with the user. All code, comments, commits, and docs in English.",
  turkish:
    "Speak Turkish with the user. All code, comments, commits, and docs in English.",
  arabic:
    "Speak Arabic with the user. All code, comments, commits, and docs in English.",
  hindi:
    "Speak Hindi with the user. All code, comments, commits, and docs in English.",
  chinese:
    "Speak Chinese (Simplified) with the user. All code, comments, commits, and docs in English.",
  japanese:
    "Speak Japanese with the user. All code, comments, commits, and docs in English.",
  korean:
    "Speak Korean with the user. All code, comments, commits, and docs in English.",
  russian:
    "Speak Russian with the user. All code, comments, commits, and docs in English.",
};

module.exports = { LANGUAGE_CHOICES, LANGUAGE_INSTRUCTIONS };
