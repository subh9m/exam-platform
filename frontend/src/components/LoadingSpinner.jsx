import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  width: ${({ size = 18 }) => `${size}px`};
  height: ${({ size = 18 }) => `${size}px`};
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.28);
  border-top-color: ${({ theme }) => theme.accent};
  display: inline-block;
  animation: ${spin} 0.8s linear infinite;
`;

export default function LoadingSpinner({ size }) {
  return <Spinner size={size} aria-hidden="true" />;
}
