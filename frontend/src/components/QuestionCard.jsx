// src/components/QuestionCard.jsx
import React, { useRef } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";

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

// --- Component Logic ---

function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
  index
}) {
  const theme = useTheme();
  const qId = question._id || question.id || `q-${index}`;
  const isTextQuestion = (question.type || "MCQ").toUpperCase() === "TEXT";
  const radioRefs = useRef([]);

  const handleChange = (option) => {
    onSelect(qId, option);
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
      <QuestionText>{question.questionText}</QuestionText>

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
    </CardContainer>
  );
}

export default QuestionCard;
