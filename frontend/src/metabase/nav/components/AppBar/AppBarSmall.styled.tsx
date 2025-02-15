import styled from "@emotion/styled";
import { color } from "metabase/lib/colors";
import { APP_BAR_HEIGHT } from "metabase/nav/constants";

export const AppBarRoot = styled.div`
  background-color: ${color("bg-white")};
`;

export interface AppBarHeaderProps {
  isSubheaderVisible?: boolean;
}

export const AppBarHeader = styled.div<AppBarHeaderProps>`
  position: relative;
  height: ${APP_BAR_HEIGHT};
  padding: 0 1rem;
  border-bottom: 1px solid transparent;
  border-color: ${props => !props.isSubheaderVisible && color("border")};
`;

export const AppBarSubheader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${color("border")};
`;

export const AppBarMainContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  height: 100%;
`;

export const AppBarToggleContainer = styled.div`
  flex: 0 0 auto;
`;

export const AppBarSearchContainer = styled.div`
  flex: 1 1 auto;
`;

export interface AppBarLogoContainerProps {
  isVisible?: boolean;
}

export const AppBarLogoContainer = styled.div<AppBarLogoContainerProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: ${props => (props.isVisible ? 1 : 0)};
  visibility: ${props => (props.isVisible ? "visible" : "hidden")};
  transition: ${props =>
    props.isVisible ? "opacity 0.3s linear 0.2s" : "none"};
`;
