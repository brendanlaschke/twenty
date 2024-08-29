import { ReactFlowProvider } from 'reactflow';

import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { gql, useSubscription } from '@apollo/client';
import { IconHierarchy2 } from 'twenty-ui';

const Sub = gql`
  subscription recordCreated {
    recordCreated {
      recordId
    }
  }
`;

export const SettingsObjectOverview = () => {
  const { data } = useSubscription(Sub);

  return (
    <SubMenuTopBarContainer
      Icon={IconHierarchy2}
      title={
        <Breadcrumb
          links={[
            { children: 'Data model', href: '/settings/objects' },
            {
              children: 'Overview',
            },
          ]}
        />
      }
    >
      <ReactFlowProvider>
        {data}
        {/*<SettingsDataModelOverview />*/}
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};
