import IconButton from '../../../view/atom/icons/icon-button';
import { DotsHorizontalIcon } from '@heroicons/react/solid';
import { IndicatorBoardMetadata } from '@/app/business/services/view-model/indicator-board-metadata-view-model.service';
import { useSelectedIndicatorBoardMetadata } from '@/app/business/hooks/indicator-board-metedata/use-selected-indicator-board-metadata-view-model.hook';
import { useDialog } from '../../../view/hooks/use-dialog.hook';
import { DIALOG_KEY } from '@/app/utils/keys/dialog-key';
import ExpandableListItem from '../../../view/molocule/expandable-list-item';
import DraggableContext from '../../../util/draggable-context';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableItem from '../../../view/atom/draggable-item';
import { useIndicatorBoardMetadataViewModel } from '@/app/business/hooks/indicator-board-metedata/use-indicator-board-metadata-view-model.hook';
import { useState } from 'react';
import { cn } from '@/app/utils/style';

type MetadataListItemProps = {
  item: IndicatorBoardMetadata;
};

export default function MetadataListItem({ item }: MetadataListItemProps) {
  const [activeDragItemId, setActiveDragItemId] = useState<string | null>(null);
  const { dialogPositionRef: iconButtonRef, openDialogWithPayload } = useDialog(DIALOG_KEY.METADATA_EDIT_MENU);
  const { selectedMetadata, selectMetadataById } = useSelectedIndicatorBoardMetadata();
  const { indicatorBoardMetadata, updateIndicatorIdsWithSessionIds } = useIndicatorBoardMetadataViewModel(item.id);

  const indicatorIdsWithSessionIds = indicatorBoardMetadata?.indicatorIdsWithSessionIds;

  const isSelected = selectedMetadata?.id === item.id;

  const handleSelect = () => {
    selectMetadataById(item.id);
  };

  const handleIconButton = () => {
    openDialogWithPayload(item);
  };

  const handleActiveChange = (activeId: string | null) => {
    setActiveDragItemId(activeId);
  };

  const hoverRender = () => {
    return (
      <IconButton
        aria-label="edit"
        ref={iconButtonRef}
        onClick={handleIconButton}
        icon={DotsHorizontalIcon}
        color={'violet'}
        className="mr-5"
      />
    );
  };

  return (
    <ExpandableListItem selected={isSelected} onSelect={handleSelect} hoverRender={hoverRender}>
      <ExpandableListItem.Title>
        <div className="py-1 pl-4">{item.name}</div>
      </ExpandableListItem.Title>
      <ExpandableListItem.ExpandedContent>
        <DraggableContext
          onActiveChange={handleActiveChange}
          onValueChange={updateIndicatorIdsWithSessionIds}
          values={indicatorIdsWithSessionIds ?? {}}
        >
          <div
            className={cn('divide-y-2', {
              'divide-white': isSelected,
              'divide-blue-200': !isSelected,
            })}
          >
            {indicatorIdsWithSessionIds
              ? Object.keys(indicatorIdsWithSessionIds).map((_, index) => (
                  <SortableContext
                    key={index}
                    id={`session${index + 1}`}
                    items={indicatorIdsWithSessionIds[`session${index + 1}`]}
                    strategy={verticalListSortingStrategy}
                  >
                    <div>
                      {indicatorIdsWithSessionIds[`session${index + 1}`].length > 0 ? (
                        indicatorIdsWithSessionIds[`session${index + 1}`].map((indicatorId) => (
                          <DraggableItem
                            className="my-2 rounded-lg bg-white ring-1 ring-blue-200 first:mt-2 last:mb-2"
                            active={activeDragItemId === indicatorId}
                            key={indicatorId}
                            id={indicatorId}
                          >
                            {indicatorId}
                          </DraggableItem>
                        ))
                      ) : (
                        <DraggableItem
                          className="my-2 rounded-lg bg-white ring-1 ring-blue-200 first:mt-2 last:mb-2"
                          active={false}
                          id={`sessionContext${index + 1}`}
                        >
                          드래그 해 주세요
                        </DraggableItem>
                      )}
                    </div>
                  </SortableContext>
                ))
              : null}
          </div>
        </DraggableContext>
      </ExpandableListItem.ExpandedContent>
    </ExpandableListItem>
  );
}
