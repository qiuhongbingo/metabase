import React, { useCallback, useState } from "react";
import { t } from "ttag";

import Button from "metabase/core/components/Button";
import LoadingSpinner from "metabase/components/LoadingSpinner";

import { delay } from "metabase/lib/promise";
import { CardApi } from "metabase/services";

import Databases from "metabase/entities/databases";

import Database from "metabase-lib/lib/metadata/Database";
import Question from "metabase-lib/lib/Question";

import { SpinnerContainer } from "./ModelCacheControl.styled";

interface ModelCacheControlProps {
  model: Question;
  size?: number;
  onChange?: (isPersisted: boolean) => void;
}

type DatabaseEntityLoaderProps = {
  database?: Database;
};

function ModelCacheControl({
  model,
  size,
  onChange,
  ...props
}: ModelCacheControlProps) {
  const [isLoading, setLoading] = useState(false);
  const label = model.isPersisted() ? t`Unpersist model` : t`Persist model`;

  const handleClick = useCallback(async () => {
    const id = model.id();
    const isPersisted = model.isPersisted();
    setLoading(true);
    try {
      if (isPersisted) {
        await CardApi.unpersist({ id });
      } else {
        await CardApi.persist({ id });
      }
      onChange?.(!isPersisted);
    } catch (err) {
      console.warn("Failed to persist/unpersist model");
    } finally {
      await delay(200);
      setLoading(false);
    }
  }, [model, onChange]);

  return (
    <Databases.Loader id={model.databaseId()} loadingAndErrorWrapper={false}>
      {({ database }: DatabaseEntityLoaderProps) => {
        if (!database || !database["can-manage"]) {
          return null;
        }
        return isLoading ? (
          <SpinnerContainer>
            <LoadingSpinner size={size} />
          </SpinnerContainer>
        ) : (
          <Button
            {...props}
            icon="database"
            onClick={handleClick}
            iconSize={size}
          >
            {label}
          </Button>
        );
      }}
    </Databases.Loader>
  );
}

export default ModelCacheControl;
