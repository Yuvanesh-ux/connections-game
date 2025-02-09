'use client'

import { useState, useEffect } from "react";

// ----------------------------
// Helper: Load State from localStorage
// ----------------------------
// This function checks localStorage for a saved game state value (by key)
// and returns it if available; otherwise, it returns the provided default.
const loadState = (key, defaultValue) => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("connectionsGameState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[key] !== undefined) {
          return parsed[key];
        }
      } catch (e) {
        console.error("Error parsing saved game state", e);
      }
    }
  }
  return defaultValue;
};

const groupsData = [
  {
    id: "chat",
    name: "Chat, Informally",
    difficulty: "yellow",
    colorClass: "bg-yellow-300",
    words: ["gab", "jaw", "yap", "yak"],
  },
  {
    id: "palindromes",
    name: "Palindromes",
    difficulty: "blue",
    colorClass: "bg-blue-300",
    words: ["bib", "eye", "gag", "pop"],
  },
  {
    id: "female-animals",
    name: "Female Animals",
    difficulty: "green",
    colorClass: "bg-green-300",
    words: ["cow", "doe", "ewe", "hen"],
  },
  {
    id: "planet-starts",
    name: "Starts of Planet Names",
    difficulty: "purple",
    colorClass: "bg-purple-300",
    words: ["ear", "mar", "mer", "sat"],
  },
];

const generateWords = () => {
  const words = [];
  groupsData.forEach((group) => {
    group.words.forEach((word) => {
      words.push({
        id: word,
        text: word,
        groupId: group.id,
      });
    });
  });
  return words;
};

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Home() {
  const mistakesAllowed = 4;

  const [words, setWords] = useState(() => {
    return loadState("words", shuffleArray(generateWords()));
  });
  const [selected, setSelected] = useState([]);
  const [guessedGroups, setGuessedGroups] = useState(() => {
    return loadState("guessedGroups", []);
  });
  const [mistakes, setMistakes] = useState(() => {
    return loadState("mistakes", 0);
  });

  useEffect(() => {
    const gameState = {
      words,
      guessedGroups,
      mistakes,
    };
    localStorage.setItem("connectionsGameState", JSON.stringify(gameState));
  }, [words, guessedGroups, mistakes]);

  const handleCardClick = (wordId) => {
    if (mistakes >= mistakesAllowed) return;

    if (selected.includes(wordId)) {
      setSelected(selected.filter((id) => id !== wordId));
    } else {
      if (selected.length < 4) {
        setSelected([...selected, wordId]);
      }
    }
  };

  const handleClearSelection = () => {
    setSelected([]);
  };

  const handleShuffle = () => {
    setWords(shuffleArray(words));
  };

  const handleSubmitGuess = () => {
    if (selected.length !== 4) return;

    const selectedWords = words.filter((word) => selected.includes(word.id));

    const groupId = selectedWords[0]?.groupId;
    const allSameGroup = selectedWords.every((word) => word.groupId === groupId);

    if (!allSameGroup) {
      setMistakes(mistakes + 1);
      setSelected([]);
      return;
    }

    const group = groupsData.find((g) => g.id === groupId);
    const selectedSet = new Set(selectedWords.map((w) => w.text));
    const groupSet = new Set(group.words);
    const isCorrect =
      selectedSet.size === groupSet.size &&
      [...selectedSet].every((word) => groupSet.has(word));

    if (isCorrect && !guessedGroups.includes(groupId)) {
      setGuessedGroups([...guessedGroups, groupId]);
      const remainingWords = words.filter((word) => word.groupId !== groupId);
      setWords(remainingWords);
      setSelected([]);
    } else {
      setMistakes(mistakes + 1);
      setSelected([]);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 text-black">
      <div className="mx-auto w-[50%]">
        <h1 className="text-3xl font-bold text-center mb-4">Connections Game</h1>

        <div className="flex justify-center items-center mb-4">
          Create four groups of four!
        </div>

        <div className="mb-4">
          {guessedGroups.map((groupId) => {
            const group = groupsData.find((g) => g.id === groupId);
            return (
              <div
                key={groupId}
                className={`p-4 py-8 mb-2 ${group.colorClass} text-center font-bold uppercase rounded`}
              >
                {group.name}: {group.words.join(", ")}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {words.map((word) => (
            <div
              key={word.id}
              className={`p-2 py-5 border rounded text-center font-bold uppercase cursor-pointer select-none 
                ${selected.includes(word.id) ? "bg-blue-200" : "bg-gray-200"}`}
              onClick={() => handleCardClick(word.id)}
            >
              {word.text}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mb-4">
          <span className="mr-2">Mistakes Remaining:</span>
          <div className="flex">
            {[...Array(mistakesAllowed - mistakes)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-700 rounded-full mx-1"></div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleShuffle}
            className="px-4 py-2 border border-black rounded-full"
          >
            Shuffle
          </button>
          <button
            onClick={handleClearSelection}
            className={`px-4 py-2 border border-black rounded-full ${selected.length > 0 ? "" : "opacity-50"}`}
          >
            Deselect All
          </button>
          <button
            onClick={handleSubmitGuess}
            className={`px-4 py-2 border border-black rounded-full ${selected.length == 4 ? "bg-black text-white" : "opacity-50"}`}
          >
            Submit
          </button>
        </div>

        {mistakes >= mistakesAllowed && (
          <div className="text-center mt-4 text-red-500 font-bold">
            Game Over
          </div>
        )}
      </div>
    </div>
  );
}