import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export type RecordFilter = {
  id: string;
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  type: FilterableFieldType;
  viewFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInViewFilterGroup?: number | null;
  label: string;
  subFieldName?: string | null | undefined;
};
