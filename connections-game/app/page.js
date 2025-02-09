'use client'

import { useState } from "react";
import { motion } from "framer-motion";

const groupsData = [
  { id: "chat", name: "Chat, Informally", difficulty: "yellow", colorClass: "bg-yellow-300", words: ["gab", "jaw", "yap", "yak"] },
  { id: "palindromes", name: "Palindromes", difficulty: "blue", colorClass: "bg-blue-300", words: ["bib", "eye", "gag", "pop"] },
  { id: "female-animals", name: "Female Animals", difficulty: "green", colorClass: "bg-green-300", words: ["cow", "doe", "ewe", "hen"] },
  { id: "planet-starts", name: "Starts of Planet Names", difficulty: "purple", colorClass: "bg-purple-300", words: ["ear", "mar", "mer", "sat"] }
];

const generateWords = () => {
  const words = [];
  groupsData.forEach(group => {
    group.words.forEach(word => {
      words.push({ id: word, text: word, groupId: group.id });
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

const hopVariant = {
  animate: { y: [0, -10, 0, -10, 0], transition: { duration: 1, times: [0, 0.25, 0.5, 0.75, 1] } }
};

export default function Home() {
  const mistakesAllowed = 4;
  const [words, setWords] = useState(shuffleArray(generateWords()));
  const [selected, setSelected] = useState([]);
  const [guessedGroups, setGuessedGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [animatingGroup, setAnimatingGroup] = useState(null);

  const handleCardClick = (wordId) => {
    if (mistakes >= mistakesAllowed || animatingGroup) return;

    if (selected.includes(wordId)) {
      setSelected(selected.filter(id => id !== wordId));
    } else if (selected.length < 4) {
      setSelected([...selected, wordId]);
    }
  };

  const handleClearSelection = () => {
    if (animatingGroup) return;

    setSelected([]);
  };

  const handleShuffle = () => {
    if (animatingGroup) return;

    setWords(shuffleArray(words));
  };

  const handleSubmitGuess = () => {
    if (selected.length !== 4 || animatingGroup) return;

    const selectedWords = words.filter(word => selected.includes(word.id));
    const groupId = selectedWords[0]?.groupId;
    const allSameGroup = selectedWords.every(word => word.groupId === groupId);
    if (!allSameGroup) {
      setMistakes(mistakes + 1);
      setSelected([]);
      return;
    }
    
    const group = groupsData.find(g => g.id === groupId);
    const selectedSet = new Set(selectedWords.map(w => w.text));
    const groupSet = new Set(group.words);
    const isCorrect = selectedSet.size === groupSet.size && [...selectedSet].every(word => groupSet.has(word));
    if (isCorrect && !guessedGroups.includes(groupId)) {
      setAnimatingGroup(groupId);
      setTimeout(() => {
        setGuessedGroups([...guessedGroups, groupId]);
        setWords(words.filter(word => word.groupId !== groupId));
        setSelected([]);
        setAnimatingGroup(null);
      }, 1000);
    } else {
      setMistakes(mistakes + 1);
      setSelected([]);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Connections Game</h1>
      <div className="text-center mb-4">
        Create four groups of four!
      </div >
      <div className="mx-auto w-[40%]">
        <div className="mb-4">
          {guessedGroups.map(groupId => {
            const group = groupsData.find(g => g.id === groupId);
            return (
              <div key={groupId} className={`p-4 mb-2 ${group.colorClass} text-center font-bold rounded`}>
                {group.name} {"\n"} {group.words.join(", ")}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {words.map(word => {
            const isSelected = selected.includes(word.id);
            const isAnimating = animatingGroup === word.groupId && isSelected;
            return (
              <motion.div
                key={word.id}
                layout
                layoutId={`word-${word.id}`}
                onClick={() => handleCardClick(word.id)}
                className={`p-4 border rounded text-center font-bold uppercase cursor-pointer select-none ${isSelected ? "bg-gray-700 text-white" : "bg-gray-200"}`}
                {...(isAnimating ? { variants: hopVariant, initial: { y: 0 }, animate: "animate" } : {})}
              >
                {word.text}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center items-center mb-4">
          <span className="mr-2">Mistakes Remaining:</span>
          <div className="flex">
            {[...Array(mistakesAllowed - mistakes)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-800 rounded-full mx-1"></div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button onClick={handleShuffle} className="px-4 py-2 bg-white border border-black rounded-full">Shuffle</button>
          <button onClick={handleClearSelection} className={`px-4 py-2 bg-white border border-black rounded-full ${selected.length > 0 ? "" : "opacity-50"}`}>Deselect All</button>
          <button onClick={handleSubmitGuess} className={`px-4 py-2 bg-white border border-black rounded-full ${selected.length !== 4 ? "opacity-50 ": "text-white bg-black"}`}>Submit</button>
        </div>
        {mistakes >= mistakesAllowed && (
          <div className="text-center mt-4 text-red-500 font-bold">Game Over</div>
        )}
      </div>
    </div>
  );
}
