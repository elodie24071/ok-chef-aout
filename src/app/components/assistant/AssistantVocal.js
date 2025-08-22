// "use client";
// import { useEffect, useMemo, useRef, useState } from "react";

// export default function AssistantVocal({ etapes = [], changeEtape }) {
//   // ---- State de base
//   const [etapeIndex, setEtapeIndex] = useState(0);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [isListening, setIsListening] = useState(false);

//   // Langue par défaut selon navigateur, avec fallback fr-FR
//   const defaultLang = typeof navigator !== "undefined" ? (navigator.language || "fr-FR") : "fr-FR";
//   const [lang, setLang] = useState(defaultLang.startsWith("en") ? "en-US" : "fr-FR");

//   // ---- Références aux APIs
//   const recognitionRef = useRef(null);
//   const synthRef = useRef(
//     typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null
//   );
//   const voicesRef = useRef([]);

//   // Texte des étapes
//   const stepsText = useMemo(() => (Array.isArray(etapes) ? etapes.map(e => e?.etape || "") : []), [etapes]);

//   // Synchroniser l'étape ouverte dans la UI parent
//   useEffect(() => {
//     if (typeof changeEtape === "function") changeEtape(etapeIndex);
//   }, [etapeIndex, changeEtape]);

//   // Charger les voix TTS
//   useEffect(() => {
//     if (!synthRef.current) return;
//     function loadVoices() {
//       const voices = synthRef.current.getVoices() || [];
//       voicesRef.current = voices;
//     }
//     loadVoices();
//     synthRef.current.onvoiceschanged = loadVoices;
//     return () => {
//       if (synthRef.current) synthRef.current.onvoiceschanged = null;
//     };
//   }, []);

//   // Instancier la reconnaissance vocale (STT)
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) return;

//     const recognition = new SR();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = lang;

//     recognition.onresult = (event) => {
//       const lastIdx = event.results.length - 1;
//       const transcript = event.results[lastIdx][0].transcript.trim().toLowerCase();
//       handleVoiceCommand(transcript);
//     };

//     recognition.onend = () => {
//       // Redémarre si on est censé écouter
//       if (isListening && !isSpeaking) {
//         try {
//           recognition.start();
//         } catch {}
//       }
//     };

//     recognition.onerror = () => {
//       // En cas d’erreur, on éteint l’écoute proprement
//       setIsListening(false);
//     };

//     recognitionRef.current = recognition;

//     return () => {
//       try {
//         recognition.stop();
//       } catch {}
//       recognitionRef.current = null;
//     };
//     // Re-crée l’instance si la langue change
//   }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ---- Helpers TTS
//   function pickVoiceForLang(targetLang) {
//     const voices = voicesRef.current || [];
//     // Match exact
//     let v = voices.find(v => v.lang === targetLang);
//     if (v) return v;
//     // Match par langue (fr / en)
//     const langPrefix = targetLang.split("-")[0];
//     v = voices.find(v => v.lang?.toLowerCase().startsWith(langPrefix));
//     return v || null;
//   }

//   function speak(text) {
//     if (!synthRef.current || !text) return;
//     // Stoppe ce qui joue déjà
//     synthRef.current.cancel();
//     setIsPaused(false);

//     const utter = new SpeechSynthesisUtterance(text);
//     utter.lang = lang;
//     const v = pickVoiceForLang(lang);
//     if (v) utter.voice = v;
//     utter.rate = 1;
//     utter.pitch = 1;
//     utter.volume = 1;

//     utter.onstart = () => {
//       setIsSpeaking(true);
//       // Pour éviter que le TTS soit ré-entendu par le micro, on coupe l’écoute pendant la lecture
//       stopListening({ silent: true });
//     };
//     utter.onend = () => {
//       setIsSpeaking(false);
//       setIsPaused(false);
//       // Après lecture, on relance l’écoute si activée
//       if (isListening) startListening({ resume: true });
//     };
//     utter.onerror = () => {
//       setIsSpeaking(false);
//       setIsPaused(false);
//     };

//     synthRef.current.speak(utter);
//   }

//   function pauseSpeaking() {
//     if (!synthRef.current) return;
//     if (synthRef.current.speaking && !synthRef.current.paused) {
//       synthRef.current.pause();
//       setIsPaused(true);
//       setIsSpeaking(false);
//     }
//   }

//   function resumeSpeaking() {
//     if (!synthRef.current) return;
//     if (synthRef.current.paused) {
//       synthRef.current.resume();
//       setIsPaused(false);
//       setIsSpeaking(true);
//     } else {
//       // Si rien n’est en pause, relire l’étape courante
//       speak(stepsText[etapeIndex]);
//     }
//   }

//   function stopSpeaking() {
//     if (!synthRef.current) return;
//     synthRef.current.cancel();
//     setIsPaused(false);
//     setIsSpeaking(false);
//   }

//   // ---- Contrôles
//   function playCurrent() {
//     speak(stepsText[etapeIndex]);
//   }

//   function prevStep() {
//     if (etapeIndex <= 0) return;
//     stopSpeaking();
//     setEtapeIndex(i => i - 1);
//     // Lire automatiquement la nouvelle étape
//     setTimeout(() => speak(stepsText[etapeIndex - 1]), 0);
//   }

//   function nextStep() {
//     if (etapeIndex >= stepsText.length - 1) return;
//     stopSpeaking();
//     setEtapeIndex(i => i + 1);
//     setTimeout(() => speak(stepsText[etapeIndex + 1]), 0);
//   }

//   // ---- Reconnaissance vocale: start/stop
//   function startListening({ resume = false } = {}) {
//     const r = recognitionRef.current;
//     if (!r) return;
//     r.lang = lang;
//     try {
//       r.start();
//       setIsListening(true);
//     } catch {}
//   }

//   function stopListening({ silent = false } = {}) {
//     const r = recognitionRef.current;
//     if (!r) return;
//     try {
//       r.stop();
//     } catch {}
//     if (!silent) setIsListening(false);
//   }

//   // ---- Parsing des commandes (FR/EN)
//   function handleVoiceCommand(raw) {
//     const t = raw.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

//     // Aller à l’étape X
//     const stepMatch = t.match(/(?:etape|step)\s*(\d+)/);
//     if (stepMatch) {
//       const target = Math.max(1, Math.min(stepsText.length, parseInt(stepMatch[1], 10)));
//       stopSpeaking();
//       setEtapeIndex(target - 1);
//       setTimeout(() => speak(stepsText[target - 1]), 0);
//       return;
//     }

//     // Suivant
//     if (
//       /\b(suivant|next)\b/.test(t) ||
//       /\b(continue|go on|forward)\b/.test(t)
//     ) {
//       nextStep();
//       return;
//     }

//     // Précédent
//     if (
//       /\b(precedent|previous|back)\b/.test(t)
//     ) {
//       prevStep();
//       return;
//     }

//     // Répète / Repeat
//     if (/\b(repete|repeter|repeat|again)\b/.test(t)) {
//       stopSpeaking();
//       speak(stepsText[etapeIndex]);
//       return;
//     }

//     // Pause
//     if (/\b(pause)\b/.test(t)) {
//       pauseSpeaking();
//       return;
//     }

//     // Reprendre / Resume
//     if (/\b(reprendre|resume|play)\b/.test(t)) {
//       resumeSpeaking();
//       return;
//     }

//     // Stop / Arrête
//     if (/\b(stop|arrete|arreter|quit)\b/.test(t)) {
//       stopSpeaking();
//       return;
//     }

//     // Commencer / Start
//     if (/\b(commence|demarre|start|begin)\b/.test(t)) {
//       stopSpeaking();
//       speak(stepsText[etapeIndex]);
//       return;
//     }
//   }

//   // ---- Effets de sécurité: reset si pas d’étapes
//   useEffect(() => {
//     if (!stepsText.length) {
//       stopSpeaking();
//       stopListening();
//       setEtapeIndex(0);
//     } else if (etapeIndex > stepsText.length - 1) {
//       setEtapeIndex(stepsText.length - 1);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [stepsText.length]);

//   if (!stepsText.length) return null;

//   // ---- UI
//   return (
//     <div className="fixed bottom-0 left-0 right-0 z-40">
//       <div className="mx-auto max-w-5xl px-4 pb-safe">
//         <div className="mb-4 rounded-t-xl border border-gray-200 bg-white/90 backdrop-blur shadow-xl">
//           {/* Header: état + langue */}
//           <div className="flex items-center justify-between px-4 py-2">
//             <div className="text-sm md:text-base font-quicksand">
//               <span className="font-bold">Étape:</span> {etapeIndex + 1} / {stepsText.length}
//             </div>
//             <div className="flex items-center gap-2">
//               <label className="text-xs md:text-sm font-quicksand">
//                 <span className="font-bold">Langue:</span>
//               </label>
//               <select
//                 value={lang}
//                 onChange={(e) => setLang(e.target.value)}
//                 className="rounded border px-2 py-1 text-xs md:text-sm"
//               >
//                 <option value="fr-FR">Français (FR)</option>
//                 <option value="en-US">English (US)</option>
//               </select>
//             </div>
//           </div>

//           {/* Corps: aperçu étape */}
//           <div className="px-4 pb-2">
//             <p className="line-clamp-2 text-xs md:text-sm text-gray-700">
//               {stepsText[etapeIndex]}
//             </p>
//           </div>

//           {/* Contrôles */}
//           <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-4 py-2">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={prevStep}
//                 disabled={etapeIndex === 0}
//                 className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
//                 aria-label="Étape précédente"
//               >
//                 ◀︎
//               </button>

//               {isSpeaking && !isPaused ? (
//                 <button
//                   onClick={pauseSpeaking}
//                   className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
//                   aria-label="Pause"
//                 >
//                   Pause
//                 </button>
//               ) : (
//                 <button
//                   onClick={isPaused ? resumeSpeaking : playCurrent}
//                   className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
//                   aria-label={isPaused ? "Reprendre" : "Lire"}
//                 >
//                   {isPaused ? "Reprendre" : "Lire"}
//                 </button>
//               )}

//               <button
//                 onClick={nextStep}
//                 disabled={etapeIndex >= stepsText.length - 1}
//                 className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
//                 aria-label="Étape suivante"
//               >
//                 ▶︎
//               </button>

//               <button
//                 onClick={stopSpeaking}
//                 className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
//                 aria-label="Stop"
//               >
//                 Stop
//               </button>
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => {
//                   if (isListening) {
//                     stopListening();
//                   } else {
//                     // Nécessite un geste utilisateur, parfait ici
//                     startListening();
//                   }
//                 }}
//                 className={`rounded px-3 py-2 text-sm text-white ${
//                   isListening ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-800 hover:bg-black"
//                 }`}
//                 aria-label="Micro"
//               >
//                 {isListening ? "Micro: ON" : "Micro: OFF"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";
// import { useState, useEffect, useRef } from "react";

// export default function AssistantVocal({ etapes = [], changeEtape }) {
//   const [isListening, setIsListening] = useState(false);
//   const [isActivated, setIsActivated] = useState(false);
//   const [currentStep, setCurrentStep] = useState(null);
//   const recognitionRef = useRef(null);

//   // Pour lire l'étape avec le numéro
//   const speakEtape = (stepIndex) => {
//     if (!etapes[stepIndex]) return;
//     const msg = `Étape ${stepIndex + 1} : ${etapes[stepIndex].etape}`;
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(msg);
//     window.speechSynthesis.speak(utterance);
//     console.log("Assistant lit :", msg);
//   };

//   const goToStep = (stepIndex) => {
//     if (stepIndex >= 0 && stepIndex < etapes.length) {
//       setCurrentStep(stepIndex);
//       changeEtape(stepIndex);
//       speakEtape(stepIndex);
//       console.log("Assistant passe à l'étape", stepIndex + 1);
//     }
//   };

//   // Liste des chiffres en lettres prise en compte
//   const chiffresLettres = {
//     une: 0,
//     deux: 1,
//     trois: 2,
//     quatre: 3,
//     cinq: 4,
//     six: 5,
//     sept: 6,
//     huit: 7,
//     neuf: 8,
//     dix: 9,
//   };

//   const processCommand = (commandRaw) => {
//     let command = commandRaw.toLowerCase().trim();
//     console.log("Commande reçue :", command);

//     // IGNORE LES COMMANDES VIDES
//     if (!command || command.length < 2) {
//       return;
//     }

//     if (!isActivated) {
//       if (command.includes("ok chef")) {
//         setIsActivated(true);
//         goToStep(0);
//         console.log('Assistant activé, lecture de la première étape.');
//         return;
//       }
//       return;
//     }

//     // Suivante
//     if (
//       command.includes("suivante") ||
//       command.includes("suivant") ||
//       command.includes("étape suivante")
//     ) {
//       const nextStep = currentStep === null ? 0 : currentStep + 1;
//       if (nextStep < etapes.length) {
//         goToStep(nextStep);
//       } else {
//         const msg = "Vous êtes à la dernière étape.";
//         window.speechSynthesis.cancel();
//         window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//         console.log(msg);
//       }
//       return;
//     }

//     // Répéter
//     if (command.includes("répéter")) {
//       if (currentStep !== null && etapes[currentStep]) {
//         speakEtape(currentStep);
//         console.log("Assistant répète l'étape", currentStep + 1);
//       } else {
//         const msg = "Aucune étape sélectionnée à répéter.";
//         window.speechSynthesis.cancel();
//         window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//         console.log(msg);
//       }
//       return;
//     }

//     // Etape X (chiffre)
//     const matchEtapeNumber = command.match(/étape ?(\d+)/);
//     if (matchEtapeNumber) {
//       const numero = parseInt(matchEtapeNumber[1], 10) - 1;
//       if (numero >= 0 && numero < etapes.length) {
//         goToStep(numero);
//         return;
//       } else {
//         const msg = `L'étape ${numero + 1} n'existe pas.`;
//         window.speechSynthesis.cancel();
//         window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//         console.log(msg);
//       }
//       return;
//     }

//     // Etape en lettres
//     const matchEtapeWord = command.match(/étape (\w+)/);
//     if (matchEtapeWord) {
//       const mot = matchEtapeWord[1];
//       if (chiffresLettres.hasOwnProperty(mot)) {
//         const numero = chiffresLettres[mot];
//         if (numero >= 0 && numero < etapes.length) {
//           goToStep(numero);
//           return;
//         } else {
//           const msg = `L'étape ${mot} n'existe pas.`;
//           window.speechSynthesis.cancel();
//           window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//           console.log(msg);
//         }
//       }
//       return;
//     }

//     // Désactivation
//     if (command.includes("stop") || command.includes("désactiver")) {
//       setIsActivated(false);
//       window.speechSynthesis.cancel();
//       window.speechSynthesis.speak(new SpeechSynthesisUtterance("Assistant désactivé. Appuyez sur le bouton pour réactiver."));
//       console.log("Assistant désactivé.");
//       return;
//     }

//     // Sinon
//     const msg = "Commande non reconnue. Dites 'étape suivante', 'répéter', ou 'étape numéro'.";
//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//     console.log(msg);
//   };

//   useEffect(() => {
//     if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
//       alert("Reconnaissance vocale non supportée par ce navigateur.");
//       return;
//     }
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognition.lang = "fr-FR";
//     recognition.interimResults = false;
//     recognition.continuous = true;

//     recognition.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript;
//       processCommand(transcript);
//     };

//     recognition.onerror = (event) => {
//       console.error("Erreur reconnaissance vocale :", event.error);
//     };

//     recognition.onend = () => {
//       // Redémarre l’écoute tant que l’assistant est censé écouter
//       if (isListening) {
//         console.log("Reconnaissance stoppée (onend), redémarrage automatique...");
//         recognition.start();
//       }
//     };

//     recognitionRef.current = recognition;

//     if (isListening) {
//       recognition.start();
//     } else {
//       recognition.stop();
//     }

//     return () => {
//       recognition.stop();
//     };
//     // eslint-disable-next-line
//   }, [isListening, isActivated, currentStep]);

//   const toggleListening = () => {
//     if (isListening) {
//       setIsListening(false);
//       setIsActivated(false);
//       setCurrentStep(null);
//       window.speechSynthesis.cancel();
//     } else {
//       setIsListening(true);
//       setIsActivated(false);
//       setCurrentStep(null);
//     }
//   };

//   return (
//     <div className="p-4 border rounded-md border-brun max-w-md mx-auto mt-6 font-quicksand">
//       <button
//         onClick={toggleListening}
//         className={`w-full py-3 font-bold rounded-md transition-colors ${isListening ? "bg-brun text-white" : "bg-gray-300 text-gray-700"
//           }`}
//         aria-pressed={isListening}
//       >
//         {isListening ? "Désactiver l'assistant vocal" : "Activer l'assistant vocal"}
//       </button>

//       <p className="mt-3 text-center italic text-sm text-brun">
//         {isListening
//           ? isActivated
//             ? "Assistant activé. Commandes possibles : 'étape x', 'suivante', 'répéter'."
//             : 'Dites "ok chef" pour commencer.'
//           : "Assistant vocal désactivé."}
//       </p>
//     </div>
//   );
// }

// "use client";
// import { useState, useEffect, useRef } from "react";

// export default function AssistantVocal({ etapes = [], changeEtape }) {
//   const [isListening, setIsListening] = useState(false);
//   const [isActivated, setIsActivated] = useState(false);
//   const [currentStep, setCurrentStep] = useState(null);

//   // Chiffres en lettres pour reconnaissance "étape une", etc.
//   const chiffresLettres = {
//     une: 0, deux: 1, trois: 2, quatre: 3, cinq: 4,
//     six: 5, sept: 6, huit: 7, neuf: 8, dix: 9,
//   };

//   // ----- GARDER UN SEUL OBJET RECOGNITION -----
//   const recognitionRef = useRef(null);

//   if (
//     typeof window !== "undefined" &&
//     !recognitionRef.current &&
//     ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
//   ) {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.lang = "fr-FR";
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.continuous = true;
//   }

//   // ----- SYNTHÈSE VOCALE D'ÉTAPE AVEC NUMÉRO -----
//   const speakEtape = (stepIndex) => {
//     if (!etapes[stepIndex]) return;
//     const msg = `Étape ${stepIndex + 1} : ${etapes[stepIndex].etape}`;
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(msg);
//     window.speechSynthesis.speak(utterance);
//     console.log("Assistant lit :", msg);
//   };

//   // ----- ALLER À UNE ÉTAPE -----
//   const goToStep = (stepIndex) => {
//     if (stepIndex >= 0 && stepIndex < etapes.length) {
//       setCurrentStep(stepIndex);
//       changeEtape(stepIndex);
//       speakEtape(stepIndex);
//       console.log("Assistant passe à l'étape", stepIndex + 1);
//     }
//   };

//   // ----- INTERPRÉTATION DES COMMANDES -----
//   const processCommand = (commandRaw) => {
//     let command = commandRaw.toLowerCase().trim();
//     console.log("Commande reçue :", command);

//     // POUR NE PAS RÉAGIR AUX TRANCRIPTS VIDES/BROUILLONS
//     if (!command || command.length < 2) return;

//     if (!isActivated) {
//       if (command.includes("ok chef")) {
//         setIsActivated(true);
//         goToStep(0);
//         console.log('Assistant activé, lecture de la première étape.');
//         return;
//       }
//       return;
//     }

//     // SUIVANTE
//     if (
//       command.includes("suivante") ||
//       command.includes("suivant") ||
//       command.includes("étape suivante")
//     ) {
//       const nextStep = currentStep === null ? 0 : currentStep + 1;
//       if (nextStep < etapes.length) {
//         goToStep(nextStep);
//       } else {
//         const msg = "Vous êtes à la dernière étape.";
//         window.speechSynthesis.cancel();
//         window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//         console.log(msg);
//       }
//       return;
//     }

//     // RÉPÉTER
//     if (command.includes("répéter")) {
//       if (currentStep !== null && etapes[currentStep]) {
//         speakEtape(currentStep);
//         console.log("Assistant répète l'étape", currentStep + 1);
//       } else {
//         const msg = "Aucune étape sélectionnée à répéter.";
//         window.speechSynthesis.cancel();
//         window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//         console.log(msg);
//       }
//       return;
//     }

//     // ÉTAPE EN CHIFFRES
//     const matchEtapeNumber = command.match(/étape ?(\d+)/);
//     if (matchEtapeNumber) {
//       const numero = parseInt(matchEtapeNumber[1], 10) - 1;
//       if (numero >= 0 && numero < etapes.length) {
//         goToStep(numero);
//         return;
//       } else {
//         const msg = `L'étape ${numero + 1} n'existe pas.`;
//         window.speechSynthesis.cancel();
//         window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//         console.log(msg);
//       }
//       return;
//     }

//     // ÉTAPE EN LETTRES
//     const matchEtapeWord = command.match(/étape (\w+)/);
//     if (matchEtapeWord) {
//       const mot = matchEtapeWord[1];
//       if (chiffresLettres.hasOwnProperty(mot)) {
//         const numero = chiffresLettres[mot];
//         if (numero >= 0 && numero < etapes.length) {
//           goToStep(numero);
//           return;
//         } else {
//           const msg = `L'étape ${mot} n'existe pas.`;
//           window.speechSynthesis.cancel();
//           window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//           console.log(msg);
//         }
//       }
//       return;
//     }

//     // DÉSACTIVATION
//     if (command.includes("stop") || command.includes("désactiver")) {
//       setIsActivated(false);
//       window.speechSynthesis.cancel();
//       window.speechSynthesis.speak(
//         new SpeechSynthesisUtterance("Assistant désactivé. Appuyez sur le bouton pour réactiver.")
//       );
//       console.log("Assistant désactivé.");
//       return;
//     }

//     // SINON
//     const msg = "Commande non reconnue. Dites 'étape suivante', 'répéter', ou 'étape numéro'.";
//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
//     console.log(msg);
//   };

//   // ----- HANDLERS QUI NE CHANGENT PAS -----
//   useEffect(() => {
//     const recognition = recognitionRef.current;
//     if (!recognition) return;

//     recognition.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript;
//       processCommand(transcript);
//     };
//     recognition.onerror = (event) => {
//       console.error("Erreur reconnaissance vocale :", event.error);
//       if (event.error === "not-allowed") {
//         alert(
//           "Accès au micro refusé. Vérifiez les permissions du micro dans le navigateur pour ce site, et assurez-vous d'avoir cliqué sur le bouton d'activation."
//         );
//         setIsListening(false);
//         setIsActivated(false);
//       }
//     };

//     // Pour réécouter en boucle
//     recognition.onend = () => {
//       if (isListening) {
//         console.log("Reconnaissance stoppée (onend), redémarrage automatique...");
//         recognition.start();
//       } else {
//         console.log("Reconnaissance stoppée (onend), arrêt normal.");
//       }
//     };
//   }, [isListening, isActivated, currentStep]);

//   // ----- GESTION ACTIVE / STOP -----
//   useEffect(() => {
//     const recognition = recognitionRef.current;
//     if (!recognition) return;
//     if (isListening) {
//       recognition.start();
//     } else {
//       recognition.stop();
//     }
//     return () => {
//       recognition.stop();
//     };
//   }, [isListening]);

//   // ----- UI -----
//   const toggleListening = () => {
//     if (isListening) {
//       setIsListening(false);
//       setIsActivated(false);
//       setCurrentStep(null);
//       window.speechSynthesis.cancel();
//     } else {
//       setIsListening(true);
//       setIsActivated(false);
//       setCurrentStep(null);
//     }
//   };

//   return (
//     <>
//       <button
//         onClick={toggleListening}
//         aria-pressed={isListening}
//         title={isListening ? "Désactiver l'assistant vocal" : "Activer l'assistant vocal"}
//         className={`
//         fixed bottom-6 right-6 flex items-center justify-center
//         rounded-full shadow-lg transition-all duration-500
//         bg-brun text-white
//         ${isListening ? "w-64 h-16 rounded-xl px-6" : "w-16 h-16"}
//         focus:outline-none focus:ring-4 focus:ring-brun focus:ring-opacity-70
//         overflow-hidden
//         font-quicksand font-semibold
//       `}
//       >
//         {/* Icône micro */}
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className={`h-6 w-6 transition-transform duration-500 ${isListening ? "mr-4 scale-150" : ""
//             }`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//           strokeWidth={2}
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M12 1v11m0 0a3 3 0 003-3V6a3 3 0 00-6 0v3a3 3 0 003 3zm0 9v4m-4 0h8"
//           />
//         </svg>

//         {/* Texte affiché quand actif */}
//         {isListening && (
//           <span className="whitespace-nowrap transition-opacity duration-700 opacity-100">
//             {`Dites "ok chef" pour commencer`}
//           </span>
//         )}
//       </button>

//       {/* Panel guide (optionnel, tu peux le garder si tu veux montrer le guide plus complet) */}
//       {isListening && isActivated && (
//         <div className="fixed bottom-24 right-6 max-w-xs bg-beige border border-brun rounded-lg p-4 text-brun font-quicksand shadow-lg">
//           <p className="mb-2 font-semibold">Guide vocal :</p>
//           <ul className="list-disc list-inside text-sm space-y-1">
//             <li><strong>ok chef</strong>{`: Démarrer l'assistant`}</li>
//             <li><strong>étape x</strong>{`: Aller à l'étape numéro x`}</li>
//             <li><strong>suivante</strong>{`: Passer à l’étape suivante`}</li>
//             <li><strong>répéter</strong>{`: Répéter l’étape courante`}</li>
//             <li><strong>stop</strong>{`: Désactiver l’assistant`}</li>
//           </ul>
//         </div>
//       )}
//     </>
//   );
// }

import { useState, useEffect, useRef } from "react";

export default function AssistantVocal({ etapes = [], changeEtape }) {
  const [isListening, setIsListening] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [isHover, setIsHover] = useState(false);

  const chiffresLettres = {
    une: 0, deux: 1, trois: 2, quatre: 3, cinq: 4,
    six: 5, sept: 6, huit: 7, neuf: 8, dix: 9,
  };

  const recognitionRef = useRef(null);

  if (
    typeof window !== "undefined" &&
    !recognitionRef.current &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  ) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "fr-FR";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.continuous = true;
  }

  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const speakEtape = (stepIndex) => {
    if (!etapes[stepIndex]) return;
    const msg = `Étape ${stepIndex + 1} : ${etapes[stepIndex].etape}`;
    speakText(msg);
    console.log("Assistant lit :", msg);
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < etapes.length) {
      setCurrentStep(stepIndex);
      changeEtape(stepIndex);
      speakEtape(stepIndex);
      console.log("Assistant passe à l'étape", stepIndex + 1);
    }
  };

  const processCommand = (commandRaw) => {
    let command = commandRaw.toLowerCase().trim();
    console.log("Commande reçue :", command);

    if (!command || command.length < 2) return;

    if (!isActivated) {
      if (command.includes("ok chef")) {
        setIsActivated(true);
        goToStep(0);
        console.log('Assistant activé, lecture de la première étape.');
        return;
      }
      return;
    }

    // suivantes, répéter, étape x, désactivation (reste identique)...

    if (
      command.includes("suivante") ||
      command.includes("suivant") ||
      command.includes("étape suivante")
    ) {
      const nextStep = currentStep === null ? 0 : currentStep + 1;
      if (nextStep < etapes.length) {
        goToStep(nextStep);
      } else {
        speakText("Vous êtes à la dernière étape.");
        console.log("Vous êtes à la dernière étape.");
      }
      return;
    }

    if (command.includes("répéter")) {
      if (currentStep !== null && etapes[currentStep]) {
        speakEtape(currentStep);
        console.log("Assistant répète l'étape", currentStep + 1);
      } else {
        speakText("Aucune étape sélectionnée à répéter.");
        console.log("Aucune étape sélectionnée à répéter.");
      }
      return;
    }

    const matchEtapeNumber = command.match(/étape ?(\d+)/);
    if (matchEtapeNumber) {
      const numero = parseInt(matchEtapeNumber[1], 10) - 1;
      if (numero >= 0 && numero < etapes.length) {
        goToStep(numero);
      } else {
        speakText(`L'étape ${numero + 1} n'existe pas.`);
        console.log(`L'étape ${numero + 1} n'existe pas.`);
      }
      return;
    }

    const matchEtapeWord = command.match(/étape (\w+)/);
    if (matchEtapeWord) {
      const mot = matchEtapeWord[1];
      if (chiffresLettres.hasOwnProperty(mot)) {
        const numero = chiffresLettres[mot];
        if (numero >= 0 && numero < etapes.length) {
          goToStep(numero);
        } else {
          speakText(`L'étape ${mot} n'existe pas.`);
          console.log(`L'étape ${mot} n'existe pas.`);
        }
      }
      return;
    }

    if (command.includes("stop") || command.includes("désactiver")) {
      setIsActivated(false);
      speakText("Assistant désactivé. Appuyez sur le bouton pour réactiver.");
      console.log("Assistant désactivé.");
      return;
    }

    speakText("Commande non reconnue. Dites 'étape suivante', 'répéter', ou 'étape numéro'.");
    console.log("Commande non reconnue.");
  };

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      processCommand(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Erreur reconnaissance vocale :", event.error);
      if (event.error === "not-allowed") {
        alert(
          "Accès au micro refusé. Vérifiez les permissions du micro dans le navigateur pour ce site, et assurez-vous d'avoir cliqué sur le bouton d'activation."
        );
        setIsListening(false);
        setIsActivated(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        console.log("Reconnaissance stoppée (onend), redémarrage automatique...");
        recognition.start();
      } else {
        console.log("Reconnaissance stoppée (onend), arrêt normal.");
      }
    };
  }, [isListening, isActivated, currentStep]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
    return () => {
      recognition.stop();
    };
  }, [isListening]);

  // ----- UI -----
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setIsActivated(false);
      setCurrentStep(null);
      window.speechSynthesis.cancel();
    } else {
      setIsListening(true);
      setIsActivated(false);
      setCurrentStep(null);
      speakText("Assistant vocal activé, dites 'ok chef' pour commencer"); // POINT 1 ici
    }
  };

  return (
    <>
      <button
        onClick={toggleListening}
        aria-pressed={isListening}
        title={isListening ? "Désactiver l'assistant vocal" : "Activer l'assistant vocal"}
        className={`
          fixed bottom-6 right-6 flex items-center justify-center
          rounded-full shadow-lg transition-all duration-500
          bg-brun text-white
          ${isListening ? "w-64 h-16 rounded-xl px-6" : "w-16 h-16"}
          focus:outline-none focus:ring-4 focus:ring-brun focus:ring-opacity-70
          overflow-hidden
          font-quicksand font-semibold
        `}
        onMouseEnter={() => setIsHover(true)}  // POINT 3
        onMouseLeave={() => setIsHover(false)} // POINT 3
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform duration-500 ${
            isListening ? "mr-4 scale-150" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 1v11m0 0a3 3 0 003-3V6a3 3 0 00-6 0v3a3 3 0 003 3zm0 9v4m-4 0h8"
          />
        </svg>

        {/* Suppression du message “Dites ok chef” sur bouton activé */}

        {/* Popup guide affiché au hover */}
        {(isHover || isActivated) && (
          <div className="absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-brun bg-beige text-brun p-3 shadow-lg font-quicksand text-sm z-50">
            <p className="mb-2 font-semibold">Guide vocal :</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>ok chef</strong>{`: Démarrer l'assistant`}</li>
              <li><strong>étape x</strong>{`: Aller à l'étape numéro x`}</li>
              <li><strong>suivante</strong>{`: Passer à l’étape suivante`}</li>
              <li><strong>répéter</strong>{`: Répéter l’étape courante`}</li>
              <li><strong>stop</strong>{`: Désactiver l’assistant`}</li>
            </ul>
          </div>
        )}
      </button>
    </>
  );
}
