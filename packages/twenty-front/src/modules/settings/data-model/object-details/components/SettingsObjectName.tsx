import styled from '@emotion/styled';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';

type SettingsObjectNameProps = {
  objectMetadataItem: ObjectMetadataItem;
  name: string;
};

const StyledObjectName = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledObjectTypeTag = styled(SettingsDataModelObjectTypeTag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsObjectName = ({
  objectMetadataItem,
  name,
}: SettingsObjectNameProps) => {
  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <StyledObjectName>
      {name}
      <StyledObjectTypeTag objectTypeLabel={objectTypeLabel} />
    </StyledObjectName>
  );
};
