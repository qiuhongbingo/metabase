import React, { useCallback, useMemo } from "react";
import { t } from "ttag";
import Filter from "metabase-lib/lib/queries/structured/Filter";
import Field from "metabase-lib/lib/metadata/Field";
import Icon from "metabase/components/Icon";

import { ALLOWED_OPERATORS } from "./constants";
import { OptionButton, OptionContainer } from "./InlineDatePicker.styled";
import { OPTIONS } from "metabase/query_builder/components/filters/pickers/DatePicker/DatePickerShortcuts";

const options = [
  OPTIONS.DAY_OPTIONS[0],
  OPTIONS.DAY_OPTIONS[1],
  OPTIONS.DAY_OPTIONS[3],
  OPTIONS.MONTH_OPTIONS[0],
];

interface InlineDatePickerProps {
  filter: Filter;
  field: Field;
  handleChange: (newFilter: Filter) => void;
}

export function InlineDatePicker({
  filter,
  field,
  handleChange,
}: InlineDatePickerProps) {
  return (
    <OptionContainer data-testid="date-picker" aria-label={field.displayName()}>
      {options.map(({ displayName, init }) => (
        <OptionButton selected={displayName === "Yesterday"} key={displayName}>
          {displayName}
        </OptionButton>
      ))}
      <OptionButton>
        <Icon name="ellipsis" size={16} />
      </OptionButton>
    </OptionContainer>
  );
}
