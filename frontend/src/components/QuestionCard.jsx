// src/components/QuestionCard.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import styled, { useTheme } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

// --- Styled Components ---

const CardContainer = styled.div`
  border-radius: 14px;
  padding: 22px;
  background: ${({ theme }) => theme.cardBg};
  backdrop-filter: blur(8px) saturate(110%);
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.03);
  margin-bottom: 20px;
  transition: background 0.4s ease, color 0.4s ease;
  position: relative;
`;

const QuestionText = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SaveIndicator = styled.span`
  display: inline-block;
  font-size: 14px;
  color: ${({ theme }) => theme.accent};
`;

const OptionsContainer = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextAnswerInput = styled.input`
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: ${({ theme }) => theme.text};
`;

const RadioInput = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s cubic-bezier(.2,1,.3,1);
  cursor: pointer;

  &:checked {
    background: ${({ theme }) => theme.accent};
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 10px ${({ theme }) => theme.accent + "66"};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accent + "55"};
    outline-offset: 2px;
  }
`;

const OptionText = styled.span`
  user-select: none;
  color: ${({ theme }) => theme.cardText};
  transition: color 0.2s ease;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.accent + "55" : "rgba(255, 255, 255, 0.05)"};
  background: ${({ $isSelected, theme }) =>
    $isSelected
      ? "linear-gradient(180deg, " + theme.accent + "11, " + theme.accent + "05)"
      : "rgba(255,255,255,0.01)"};
  transform: ${({ $isSelected }) => ($isSelected ? "translateY(-2px)" : "none")};
  transition: all 0.2s cubic-bezier(.2,1,.3,1);

  &:hover {
    border-color: ${({ theme }) => theme.accent + "44"};
    transform: translateY(-2px);
  }

  ${RadioInput}:checked + ${OptionText} {
    color: ${({ theme }) => theme.accent};
    font-weight: 500;
  }
`;

const ActionsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  min-height: 44px;
`;

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 12px;
  background: ${({ theme }) => `linear-gradient(90deg, ${theme.accent}, ${theme.score})`};
  color: #fff;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 18px ${({ theme }) => theme.accent + "33"};
  transition: all 0.25s cubic-bezier(.2,1,.3,1);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 25px ${({ theme }) => theme.accent + "44"};
  }

  &:active {
    transform: translateY(-1px) scale(.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Snackbar = styled(motion.div)`
  position: absolute;
  bottom: 22px;
  left: 22px;
  color: ${({ theme }) => theme.accent};
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
`;

// --- Component Logic ---

function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
  onSave,
  index,
  isPersisted = false
}) {
  const theme = useTheme();
  const qId = question._id || question.id || `q-${index}`;
  const isTextQuestion = (question.type || "MCQ").toUpperCase() === "TEXT";
  const [isSaving, setIsSaving] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(isPersisted);
  const radioRefs = useRef([]);

  useEffect(() => {
    setHasBeenSaved(isPersisted);
  }, [isPersisted]);

  const handleChange = (option) => {
    onSelect(qId, option);
  };

  const handleSaveClick = () => {
    if (typeof onSave === "function") {
      onSave(qId, selectedAnswer);
      setIsSaving(true);
      setShowSnackbar(true);
      setHasBeenSaved(true);

      setTimeout(() => setShowSnackbar(false), 1800);
      setTimeout(() => setIsSaving(false), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (isTextQuestion) return;
    const options = question.options || [];
    if (["ArrowDown", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const currentIdx = options.indexOf(selectedAnswer);
      const nextIdx = (currentIdx + 1) % options.length;
      handleChange(options[nextIdx]);
      radioRefs.current[nextIdx]?.focus();
    } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      const currentIdx = options.indexOf(selectedAnswer);
      const prevIdx = (currentIdx - 1 + options.length) % options.length;
      handleChange(options[prevIdx]);
      radioRefs.current[prevIdx]?.focus();
    }
  };

  return (
    <CardContainer>
      <QuestionText>
        {question.questionText}
        {hasBeenSaved && <SaveIndicator>✅</SaveIndicator>}
      </QuestionText>

      <OptionsContainer role={isTextQuestion ? undefined : "radiogroup"} onKeyDown={handleKeyDown}>
        {isTextQuestion ? (
          <TextAnswerInput
            type="text"
            value={selectedAnswer || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type your answer"
          />
        ) : Array.isArray(question.options) ? (
          question.options.map((option, idx) => {
            const inputId = `q-${qId}-opt-${idx}`;
            return (
              <OptionLabel
                key={idx}
                htmlFor={inputId}
                $isSelected={selectedAnswer === option}
              >
                <RadioInput
                  ref={(el) => (radioRefs.current[idx] = el)}
                  type="radio"
                  name={`q-${qId}`}
                  id={inputId}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={() => handleChange(option)}
                />
                <OptionText>{option}</OptionText>
              </OptionLabel>
            );
          })
        ) : (
          <p style={{ color: theme.cardText }}>No options available</p>
        )}
      </OptionsContainer>

      <AnimatePresence>
        {showSnackbar && (
          <Snackbar
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            ✅ Answer saved!
          </Snackbar>
        )}
      </AnimatePresence>

      <ActionsContainer>
        {selectedAnswer && (
          <SaveButton onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? "Saved!" : "Save"}
          </SaveButton>
        )}
      </ActionsContainer>
    </CardContainer>
  );
}

export default QuestionCard;
