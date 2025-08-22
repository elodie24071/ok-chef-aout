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
