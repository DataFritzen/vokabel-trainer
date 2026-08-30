export type OptionalAiCapabilities = {
  imageGeneration: boolean;
  textToSpeech: boolean;
  speechRecognition: boolean;
  mnemonicSuggestions: boolean;
};

// Der kostenlose MVP bleibt vollständig lokal. Diese Schnittstelle ist bewusst
// vorbereitet, damit später ein serverseitiger Anbieter ergänzt werden kann,
// ohne API-Schlüssel in der PWA zu speichern.
export const optionalAiCapabilities: OptionalAiCapabilities = {
  imageGeneration: false,
  textToSpeech: false,
  speechRecognition: false,
  mnemonicSuggestions: false,
};
