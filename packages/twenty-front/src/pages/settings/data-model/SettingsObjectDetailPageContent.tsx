/* eslint-disable react/jsx-props-no-spreading */
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getDisabledFieldMetadataItems } from '@/object-metadata/utils/getDisabledFieldMetadataItems';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectName } from '@/settings/data-model/object-details/components/SettingsObjectName';
import {
  SettingsDataModelObjectAboutForm,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { settingsDataModelObjectIdentifiersFormSchema } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import { settingsUpdateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsUpdateObjectInputSchema';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { isNonEmptyArray } from '@sniptt/guards';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  H2Title,
  IconArchive,
  IconHierarchy2,
  IconListDetails,
  IconPlus,
  IconSettings,
} from 'twenty-ui';
import { z } from 'zod';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';
import { SETTINGS_OBJECT_TAB_LIST_COMPONENT_ID } from '~/pages/settings/data-model/constants/SettingsOjectTabListComponentId';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const objectEditFormSchema = z
  .object({})
  .merge(settingsDataModelObjectAboutFormSchema)
  .merge(settingsDataModelObjectIdentifiersFormSchema);

type SettingsObjectDetailPageContentProps = {
  objectMetadataItem: ObjectMetadataItem;
};

type SettingsDataModelObjectEditFormValues = z.infer<
  typeof objectEditFormSchema
>;

export const SettingsObjectDetailPageContent = ({
  objectMetadataItem,
}: SettingsObjectDetailPageContentProps) => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const { activeTabIdState } = useTabList(
    SETTINGS_OBJECT_TAB_LIST_COMPONENT_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleDisableObject = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(getSettingsPagePath(SettingsPath.Objects));
  };

  const disabledFieldMetadataItems =
    getDisabledFieldMetadataItems(objectMetadataItem);

  const shouldDisplayAddFieldButton = !objectMetadataItem.isRemote;

  const handleSave = async (
    formValues: SettingsDataModelObjectEditFormValues,
  ) => {
    const dirtyFieldKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsDataModelObjectEditFormValues)[];

    try {
      await updateOneObjectMetadataItem({
        idToUpdate: objectMetadataItem.id,
        updatePayload: settingsUpdateObjectInputSchema.parse(
          pick(formValues, dirtyFieldKeys),
        ),
      });
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };
  const formConfig = useForm<SettingsDataModelObjectEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(objectEditFormSchema),
  });
  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isDirty && isValid && !isSubmitting;

  const tabs = [
    {
      id: 'fields',
      title: 'Fields',
      Icon: IconListDetails,
    },
    {
      id: 'settings',
      title: 'Settings',
      Icon: IconSettings,
    },
  ];

  return (
    <SubMenuTopBarContainer
      Icon={IconHierarchy2}
      title={
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: objectMetadataItem.labelPlural },
          ]}
        />
      }
      actionButton={
        objectMetadataItem.isCustom ? (
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            onCancel={() => formConfig.reset()}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        ) : (
          <></>
        )
      }
    >
      <SettingsPageContainer>
        <Section>
          <SettingsObjectName
            name={objectMetadataItem.labelPlural || ''}
            objectMetadataItem={objectMetadataItem}
          />
        </Section>
        <TabList
          tabListId={SETTINGS_OBJECT_TAB_LIST_COMPONENT_ID}
          tabs={tabs}
        />
        {activeTabId === 'fields' && (
          <Section>
            <H2Title
              title="Fields"
              description={`Customise the fields available in the ${objectMetadataItem.labelSingular} views and their display order in the ${objectMetadataItem.labelSingular} detail view and menus.`}
            />
            <SettingsObjectFieldTable
              objectMetadataItem={objectMetadataItem}
              mode="view"
            />
            {shouldDisplayAddFieldButton && (
              <StyledDiv>
                <UndecoratedLink
                  to={
                    isNonEmptyArray(disabledFieldMetadataItems)
                      ? './new-field/step-1'
                      : './new-field/step-2'
                  }
                >
                  <Button
                    Icon={IconPlus}
                    title="Add Field"
                    size="small"
                    variant="secondary"
                  />
                </UndecoratedLink>
              </StyledDiv>
            )}
          </Section>
        )}

        {activeTabId === 'settings' && (
          <RecordFieldValueSelectorContextProvider>
            <FormProvider {...formConfig}>
              <Section>
                <H2Title
                  title="About"
                  description="Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms."
                />
                <SettingsDataModelObjectAboutForm
                  disabled={!objectMetadataItem.isCustom}
                  disableNameEdit
                  objectMetadataItem={objectMetadataItem}
                />
              </Section>
              <Section>
                <H2Title
                  title="Settings"
                  description="Choose the fields that will identify your records"
                />
                <SettingsDataModelObjectSettingsFormCard
                  objectMetadataItem={objectMetadataItem}
                />
              </Section>
              <Section>
                <H2Title title="Danger zone" description="Deactivate object" />
                <Button
                  Icon={IconArchive}
                  title="Deactivate"
                  size="small"
                  onClick={handleDisableObject}
                />
              </Section>
            </FormProvider>
          </RecordFieldValueSelectorContextProvider>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
