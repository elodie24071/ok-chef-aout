"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function AssistantVocalTest({ etapes = [], changeEtape }) {
    const [supporte, setSupporte] = useState(false);
    const [ecoute, setEcoute] = useState(false);
    const [active, setActive] = useState(false);
    const [etapeActuelle, setEtapeActuelle] = useState(0);
    const [showFallback, setShowFallback] = useState(false);
    const [msgStatut, setMsgStatut] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [isReadingStep, setIsReadingStep] = useState(false);
    const [voices, setVoices] = useState([]);

    const recognitionRef = useRef(null);
    const utteranceRef = useRef(null);
    const restartTimeoutRef = useRef(null);

    const CONFIDENCE_THRESHOLD = 0.7;

    const gererVocal = useCallback((action, params = {}) => {
        const { texte, isStep = false, etapeIndex } = params;

        switch (action) {
            case 'parler':
                window.speechSynthesis.cancel();
                if (utteranceRef.current) utteranceRef.current = null;

                const utterance = new SpeechSynthesisUtterance(texte);
                utterance.lang = 'fr-FR';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 0.8;

                const voices = window.speechSynthesis.getVoices();
                const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
                if (frenchVoice) utterance.voice = frenchVoice;

                utterance.onstart = () => {
                    setIsProcessing(true);
                    if (isStep) setIsReadingStep(true);
                };

                utterance.onend = utterance.onerror = () => {
                    setIsProcessing(false);
                    utteranceRef.current = null;
                    if (isStep) setIsReadingStep(false);
                };

                utteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
                break;

            case 'changerEtape':
                const isValidIndex = etapeIndex >= 0 && etapeIndex < etapes.length;

                // Hors limites
                if (etapeIndex < 0) {
                    gererVocal('parler', { texte: "Vous êtes déjà à la première étape" });
                    return;
                }
                if (etapeIndex >= etapes.length) {
                    gererVocal('parler', { texte: "C’est la fin de la recette. Bon appétit ! 🍽️" });
                    return;
                }

                // Navigation normale
                setEtapeActuelle(etapeIndex);
                if (changeEtape) changeEtape(etapeIndex);
                console.log(`🎯 Assistant lit l'étape ${etapeIndex + 1}/${etapes.length}: ${etapes[etapeIndex]?.etape || 'Étape non définie'}`);

                setTimeout(() => {
                    const etapeTexte = etapes[etapeIndex]?.etape;
                    if (etapeTexte) {
                        let texteFinal = `Étape ${etapeIndex + 1}: ${etapeTexte}`;
                        if (etapeIndex === etapes.length - 1) {
                            texteFinal += ". C’est la fin de la recette. Bon appétit !";
                        }

                        gererVocal('parler', {
                            texte: texteFinal,
                            isStep: true
                        });
                    }
                }, 500);

                setLastCommand(`Étape ${etapeIndex + 1}`);
                break;

        }
    }, [etapes, changeEtape]);

    const traiterCommande = useCallback((transcript, confidence) => {
        if (confidence < CONFIDENCE_THRESHOLD) return false;

        const texte = transcript.toLowerCase().trim();

        const matchNumero = texte.match(/(\d+)/);
        if (matchNumero) {
            const numero = parseInt(matchNumero[1]);
            if (numero >= 1 && numero <= etapes.length) {
                gererVocal('changerEtape', { etapeIndex: numero - 1 });
                return true;
            }
        }

        const commandes = {
            'suivant': () => setEtapeActuelle((prev) => {
                const newIndex = Math.min(prev + 1, etapes.length - 1);
                gererVocal('changerEtape', { etapeIndex: newIndex });
                return newIndex;
            }),

            'précédent': () => setEtapeActuelle((prev) => {
                const newIndex = Math.max(prev - 1, 0);
                gererVocal('changerEtape', { etapeIndex: newIndex });
                return newIndex;
            }),

            'répéter': () => setEtapeActuelle((prev) => {
                gererVocal('changerEtape', { etapeIndex: prev });
                return prev;
            }),

            'commencer': () => gererVocal('changerEtape', { etapeIndex: 0 }),
            'fin': () => gererVocal('changerEtape', { etapeIndex: etapes.length - 1 }),

            'stop': () => {
                setEcoute(false);
                gererVocal('parler', { texte: "Arrêté" });
            },

            'next': () => gererVocal('changerEtape', { etapeIndex: etapeActuelle + 1 }),
            'back': () => gererVocal('changerEtape', { etapeIndex: etapeActuelle - 1 }),
            'again': () => gererVocal('changerEtape', { etapeIndex: etapeActuelle })
        };

        for (const [mot, action] of Object.entries(commandes)) {
            if (texte === mot || texte.includes(mot)) {
                action();
                return true;
            }
        }

        return false;
    }, [etapeActuelle, etapes.length, gererVocal]);

    const gererErreurReconnaissance = useCallback((error) => {
        const messages = {
            'no-speech': "Aucune parole détectée",
            'audio-capture': "Erreur microphone",
            'not-allowed': "Microphone non autorisé",
            'network': "Erreur réseau"
        };

        setMsgStatut(messages[error] || `Erreur: ${error}`);
        if (error === 'not-allowed') setEcoute(false);
    }, []);

    const setupRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.stop();

        Object.assign(recognition, {
            continuous: true,
            interimResults: false,
            lang: 'fr-FR',
            maxAlternatives: 1
        });

        recognition.onstart = () => clearTimeout(restartTimeoutRef.current);

        recognition.onresult = (event) => {
            // ignorer si l'assistant parle (évite l'auto-écoute)
            if (isReadingStep || isProcessing) return;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];

                if (result.isFinal) {
                    const [transcript, confidence] = [result[0].transcript, result[0].confidence];

                    // Vérifie si c'est vraiment une commande (plus de 2 caractères)
                    if (transcript.trim().length < 3) return;

                    console.log(`🎤 Détecté: "${transcript}" (confiance: ${confidence})`);

                    const commandeReconnue = traiterCommande(transcript, confidence);

                    if (!commandeReconnue && confidence > 0.9 && transcript.split(" ").length <= 2) {
                        console.warn("Commande non reconnue:", transcript);
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') return;
            gererErreurReconnaissance(event.error);
        };

        recognition.onend = () => {
            console.log("✅ Assistant a fini de parler");
            recognition.start();
            if (ecoute) {
                restartTimeoutRef.current = setTimeout(() => {
                    if (ecoute && recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (error) {
                            console.error('Erreur redémarrage:', error);
                            setEcoute(false);
                        }
                    }
                }, 500);
            }
        };

        return recognition;
    }, [ecoute, traiterCommande, isReadingStep, gererVocal, gererErreurReconnaissance, isProcessing]);

    useEffect(() => {
        const checkSupport = () => {
            const isSupported = 'speechSynthesis' in window &&
                ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

            setSupporte(isSupported);
            setMsgStatut(isSupported ? "Assistant vocal prêt !" : "Assistant vocal non supporté par ce navigateur.");
            setShowFallback(!isSupported);

            if (isSupported) window.speechSynthesis.getVoices();
        };

        checkSupport();

        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = checkSupport;
            return () => { window.speechSynthesis.onvoiceschanged = null; };
        }
    }, []);

    const toggleEcoute = useCallback(() => {
        if (!ecoute) {
            try {
                const recognition = setupRecognition();
                recognitionRef.current = recognition;
                recognition.start();
                setEcoute(true);
                setMsgStatut("Écoute en cours...");
            } catch (error) {
                console.error('Erreur démarrage reconnaissance:', error);
                setMsgStatut("Erreur lors du démarrage");
            }
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            clearTimeout(restartTimeoutRef.current);
            setEcoute(false);
            setMsgStatut("Écoute arrêtée");
        }
    }, [ecoute, setupRecognition]);

    const testAssistant = useCallback(() => {
        if (!supporte) {
            setShowFallback(true);
            return;
        }

        setIsProcessing(true);
        gererVocal('parler', { texte: 'Bonjour, appuyez sur le bouton et dites "commencer"' });

        setTimeout(() => {
            setMsgStatut("Assistant activé !");
            setActive(true);
            setIsProcessing(false);
        }, 3000);
    }, [supporte, gererVocal]);

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
            if (utteranceRef.current) window.speechSynthesis.cancel();
            clearTimeout(restartTimeoutRef.current);
        };
    }, []);

    const getTooltipText = () => {
        if (isProcessing) return "Assistant en train de parler...";
        if (!active) return "Activer l'assistant vocal";
        if (!ecoute) return "Cliquez pour activer l'écoute vocale";

        return `Commandes: "suivant", "précédent", "répéter"\nNuméros: "1", "2", "3"...\nContrôles: "commencer", "fin", "stop"${lastCommand ? `\nDernière: ${lastCommand}` : ''}`;
    };

    const getButtonClasses = () => {
        const baseClasses = "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center text-2xl font-bold hover:scale-110 hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed";

        const stateClasses = ecoute
            ? "bg-red-500 text-white animate-pulse ring-4 ring-red-300"
            : active
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-orange text-white hover:bg-brun";

        const processingClass = isProcessing ? "animate-spin" : "";

        return `${baseClasses} ${stateClasses} ${processingClass}`;
    };

    const getButtonIcon = () => {
        return isProcessing ? '⏳' : ecoute ? '🔴' : active ? '🎤' : '▶️';
    };

    const getStatusText = () => {
        return isProcessing ? "🗣️ Parle..." : ecoute ? "🔊 Écoute..." : "💤 En attente";
    };

    if (!supporte && !showFallback) return null;

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <div className="relative group">
                    <button
                        onClick={active ? toggleEcoute : testAssistant}
                        disabled={isProcessing}
                        className={getButtonClasses()}
                        title={getTooltipText()}
                    >
                        {getButtonIcon()}
                    </button>

                    {/* compteur d'étapes */}
                    {active && etapes.length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-brun text-jaune text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-300">
                            {etapeActuelle + 1}/{etapes.length}
                        </div>
                    )}

                    {/* Tooltip détaillé au hover */}
                    <div className="absolute bottom-20 right-0 mb-2 px-3 py-2 bg-brun text-jaune text-xs md:text-sm rounded-lg shadow-lg whitespace-pre max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {getTooltipText()}
                    </div>
                </div>

                {/* Indicateur de statut */}
                {active && (
                    <div className="absolute -bottom-8 right-0 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                        {getStatusText()}
                    </div>
                )}
            </div>

            {/* Interface de secours pour navigateurs non compatibles */}
            {showFallback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 m-4 max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Assistant Vocal</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {"La reconnaissance vocale n'est pas supportée. Utilisez les contrôles manuels :"}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                { text: "← Précédent", action: () => gererVocal('changerEtape', { etapeIndex: etapeActuelle - 1 }), disabled: etapeActuelle === 0 },
                                { text: "Répéter", action: () => gererVocal('changerEtape', { etapeIndex: etapeActuelle }), disabled: false },
                                { text: "Suivant →", action: () => gererVocal('changerEtape', { etapeIndex: etapeActuelle + 1 }), disabled: etapeActuelle === etapes.length - 1 }
                            ].map(({ text, action, disabled }, index) => (
                                <button
                                    key={index}
                                    className={`px-3 py-1 text-white rounded text-sm transition-colors ${disabled
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : index === 1
                                            ? "bg-blue-500 hover:bg-blue-600"
                                            : "bg-gray-500 hover:bg-gray-600"
                                        }`}
                                    onClick={action}
                                    disabled={disabled}
                                >
                                    {text}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowFallback(false)}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}