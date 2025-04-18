"use client"

import { motion } from "framer-motion"

export function MoodSelector({ onSelect, selectedMood }) {
  const moods = [
    { type: "happy", emoji: "😊", label: "Happy" },
    { type: "neutral", emoji: "😐", label: "Neutral" },
    { type: "sad", emoji: "😢", label: "Sad" },
  ]

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-lg font-medium text-center">How are you feeling today?</h2>
      <div className="flex justify-center space-x-6">
        {moods.map((mood) => (
          <motion.button
            key={mood.type}
            onClick={() => onSelect(mood.type)}
            className={`relative p-3 rounded-full ${
              selectedMood === mood.type ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-primary/5"
            }`}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: selectedMood === mood.type ? 1.1 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 10,
            }}
            aria-label={mood.label}
            aria-pressed={selectedMood === mood.type}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="sr-only">{mood.label}</span>
            {selectedMood === mood.type && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      <div className="text-sm text-center text-muted-foreground h-5">
        {selectedMood && `You selected: ${moods.find((m) => m.type === selectedMood)?.label}`}
      </div>
    </div>
  )
}
