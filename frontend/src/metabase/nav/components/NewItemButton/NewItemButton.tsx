import React from "react";
import { t } from "ttag";
import { NewButton, NewButtonText, NewMenu } from "./NewItemButton.styled";

const NewItemButton = () => {
  return (
    <NewMenu>
      <NewButton
        primary
        icon="add"
        iconSize={14}
        data-metabase-event="NavBar;Create Menu Click"
      >
        <NewButtonText>{t`New`}</NewButtonText>
      </NewButton>
    </NewMenu>
  );
};

export default NewItemButton;
