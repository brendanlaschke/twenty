import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { EmailAliasManagerModule } from 'src/modules/connected-account/email-alias-manager/email-alias-manager.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-history.service';
import { MicrosoftGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-message-list.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { MessageParticipantManagerModule } from 'src/modules/messaging/message-participant-manager/message-participant-manager.module';

@Module({
  imports: [
    EnvironmentModule,
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    MessagingCommonModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    OAuth2ClientManagerModule,
    EmailAliasManagerModule,
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    MessageParticipantManagerModule,
  ],
  providers: [
    MicrosoftGetHistoryService,
    MicrosoftFetchByBatchService,
    MicrosoftGetMessagesService,
    MicrosoftGetMessageListService,
  ],
  exports: [MicrosoftGetMessagesService, MicrosoftGetMessageListService],
})
export class MessagingMicrosoftDriverModule {}
