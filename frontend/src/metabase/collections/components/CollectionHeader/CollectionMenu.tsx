import React from "react";
import { t } from "ttag";
import { PLUGIN_COLLECTIONS } from "metabase/plugins";
import * as Urls from "metabase/lib/urls";
import EntityMenu from "metabase/components/EntityMenu";
import { ANALYTICS_CONTEXT } from "metabase/collections/constants";
import {
  isPersonalCollection,
  isRootCollection,
} from "metabase/collections/utils";
import { Collection } from "metabase-types/api";

export interface CollectionMenuProps {
  collection: Collection;
  isAdmin: boolean;
  isPersonalCollectionChild: boolean;
  onUpdateCollection: (entity: Collection, values: Partial<Collection>) => void;
}

const CollectionMenu = ({
  collection,
  isAdmin,
  isPersonalCollectionChild,
  onUpdateCollection,
}: CollectionMenuProps): JSX.Element | null => {
  const items = [];
  const url = Urls.collection(collection);
  const isRoot = isRootCollection(collection);
  const isPersonal = isPersonalCollection(collection);
  const canWrite = collection.can_write;

  if (isAdmin && !isRoot && !isPersonal && !isPersonalCollectionChild) {
    items.push(
      ...PLUGIN_COLLECTIONS.getAuthorityLevelMenuItems(
        collection,
        onUpdateCollection,
      ),
    );
  }

  if (isAdmin && !isPersonal && !isPersonalCollectionChild) {
    items.push({
      title: t`Edit permissions`,
      icon: "lock",
      link: `${url}/permissions`,
      event: `${ANALYTICS_CONTEXT};Edit Menu;Edit Permissions`,
    });
  }

  if (!isRoot && !isPersonal && canWrite) {
    items.push(
      {
        title: t`Move`,
        icon: "move",
        link: `${url}/move`,
        event: `${ANALYTICS_CONTEXT};Edit Menu;Move Collection`,
      },
      {
        title: t`Archive`,
        icon: "view_archive",
        link: `${url}/archive`,
        event: `${ANALYTICS_CONTEXT};Edit Menu;Archive Collection`,
      },
    );
  }

  if (items.length > 0) {
    return <EntityMenu items={items} triggerIcon="ellipsis" />;
  } else {
    return null;
  }
};

export default CollectionMenu;
