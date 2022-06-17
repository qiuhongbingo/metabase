import React, { useCallback, useMemo } from "react";
import { t } from "ttag";
import _ from "underscore";
import Filter from "metabase-lib/lib/queries/structured/Filter";
import Field from "metabase-lib/lib/metadata/Field";
import Icon from "metabase/components/Icon";

import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";
import Dimension from "metabase-lib/lib/Dimension";

import TippyPopoverWithTrigger from "metabase/components/PopoverWithTrigger/TippyPopoverWithTrigger";
import { OPTIONS } from "metabase/query_builder/components/filters/pickers/DatePicker/DatePickerShortcuts";

import { OptionButton, OptionContainer } from "./InlineDatePicker.styled";
import { SelectFilterPopover } from "../BulkFilterSelect/BulkFilterSelect.styled";
import { P } from "cljs/goog.dom.tagname";

const options = [
  OPTIONS.DAY_OPTIONS[0],
  OPTIONS.DAY_OPTIONS[1],
  OPTIONS.DAY_OPTIONS[2],
  OPTIONS.MONTH_OPTIONS[0],
];

interface InlineDatePickerProps {
  query: StructuredQuery;
  filter?: Filter;
  newFilter: Filter;
  dimension: Dimension;
  handleChange: (newFilter: Filter) => void;
  handleClear: () => void;
}

export function InlineDatePicker({
  query,
  filter,
  newFilter,
  dimension,
  handleChange,
  handleClear,
}: InlineDatePickerProps) {
  console.log("newFilter", newFilter);

  const selectedFilterIndex = useMemo(() => {
    if (!filter) {
      return null;
    }
    const optionIndex = options.findIndex(({ init }) =>
      _.isEqual(filter, init(filter)),
    );
    return optionIndex !== -1 ? optionIndex : null;
  }, [filter]);

  return (
    <OptionContainer
      data-testid="date-picker"
      aria-label={dimension?.field()?.displayName()}
    >
      {!filter || selectedFilterIndex !== null ? (
        options.map(({ displayName, init }, index) => (
          <OptionButton
            key={displayName}
            selected={index === selectedFilterIndex}
            // TODO handle newFilter
            onClick={() => handleChange(init(filter ?? newFilter))}
          >
            {displayName}
          </OptionButton>
        ))
      ) : (
        <OptionButton selected>
          {filter.displayName({ includeDimension: false })}
          <button onClick={handleClear}>
            <Icon
              name="close"
              size={11}
              className="text-brand ml2 cursor-pointer"
            />
          </button>
        </OptionButton>
      )}
      <TippyPopoverWithTrigger
        sizeToFit
        renderTrigger={({ onClick }) => (
          <OptionButton onClick={onClick}>
            <Icon name="ellipsis" size={14} />
          </OptionButton>
        )}
        popoverContent={({ closePopover }) => (
          <SelectFilterPopover
            query={query}
            filter={filter ?? newFilter}
            isNew={filter == null}
            showCustom={false}
            showFieldPicker={false}
            onChangeFilter={handleChange}
            onClose={closePopover}
            commitOnBlur
          />
        )}
      />
    </OptionContainer>
  );
}
