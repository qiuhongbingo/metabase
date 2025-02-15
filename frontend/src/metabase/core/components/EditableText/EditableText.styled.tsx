import styled from "@emotion/styled";
import { color } from "metabase/lib/colors";

export interface EditableTextRootProps {
  isDisabled: boolean;
}

export const EditableTextRoot = styled.div<EditableTextRootProps>`
  position: relative;
  color: ${color("text-dark")};
  padding: 0.25rem;
  border: 1px solid transparent;

  &:hover,
  &:focus-within {
    border-color: ${props => (props.isDisabled ? "" : color("border"))};
  }

  &:after {
    content: attr(data-value);
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

export const EditableTextArea = styled.textarea`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: inherit;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  cursor: ${props => (props.disabled ? "text" : "pointer")};
  border: none;
  resize: none;
  outline: none;
  overflow: hidden;
  background: transparent;

  &:focus {
    cursor: text;
  }
`;
