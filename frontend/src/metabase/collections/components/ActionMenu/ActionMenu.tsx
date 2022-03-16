import React, { useCallback, useEffect, useState } from "react";

import { ANALYTICS_CONTEXT } from "metabase/collections/constants";
import { Item, Collection, isItemPinned } from "metabase/collections/utils";
import EventSandbox from "metabase/components/EventSandbox";

import { EntityItemMenu } from "./ActionMenu.styled";
import { Bookmarks } from "metabase-types/api/bookmark";

type Props = {
  bookmarks?: Bookmarks;
  createBookmark?: (id: string, collection: string) => void;
  deleteBookmark?: (id: string, collection: string) => void;
  className?: string;
  item: Item;
  collection: Collection;
  onCopy: (items: Item[]) => void;
  onMove: (items: Item[]) => void;
};

function getIsBookmarked(item: Item, bookmarks: Bookmarks) {
  return bookmarks.some(
    bookmark => bookmark.type === item.model && bookmark.item_id === item.id,
  );
}

function ActionMenu({
  bookmarks,
  createBookmark,
  deleteBookmark,
  className,
  item,
  collection,
  onCopy,
  onMove,
}: Props) {
  const [isBookmarked, setIsBookmarked] = useState(
    bookmarks && getIsBookmarked(item, bookmarks),
  );

  useEffect(() => {
    bookmarks && setIsBookmarked(getIsBookmarked(item, bookmarks));
  }, [item, bookmarks]);

  const handlePin = useCallback(() => {
    item.setPinned(!isItemPinned(item));
  }, [item]);

  const handleCopy = useCallback(() => {
    onCopy([item]);
  }, [item, onCopy]);

  const handleMove = useCallback(() => {
    onMove([item]);
  }, [item, onMove]);

  const handleArchive = useCallback(() => {
    item.setArchived(true);
  }, [item]);

  const handleToggleBookmark = useCallback(() => {
    const toggleBookmark = isBookmarked ? deleteBookmark : createBookmark;

    toggleBookmark?.(item.id + "", item.model);
  }, [createBookmark, deleteBookmark, isBookmarked, item]);

  return (
    // this component is used within a `<Link>` component,
    // so we must prevent events from triggering the activation of the link
    <EventSandbox preventDefault>
      <EntityItemMenu
        className={className}
        item={item}
        isBookmarked={isBookmarked}
        onPin={collection.can_write ? handlePin : null}
        onMove={collection.can_write && item.setCollection ? handleMove : null}
        onCopy={item.copy ? handleCopy : null}
        onArchive={
          collection.can_write && item.setArchived ? handleArchive : null
        }
        onToggleBookmark={handleToggleBookmark}
        analyticsContext={ANALYTICS_CONTEXT}
      />
    </EventSandbox>
  );
}

export default ActionMenu;
