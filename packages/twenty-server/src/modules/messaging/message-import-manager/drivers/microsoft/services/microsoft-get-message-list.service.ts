import { Injectable } from '@nestjs/common';

import {
  Client,
  PageCollection,
  PageIterator,
  PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';
import { MailFolder } from '@microsoft/microsoft-graph-types';

import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import {
  GetFullMessageListResponse,
  GetPartialMessageListResponse,
} from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

@Injectable()
export class MicrosoftGetMessageListService {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly gmailGetHistoryService: GmailGetHistoryService,
  ) {}

  public async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
  ): Promise<GetFullMessageListResponse> {
    const microsoftClient =
      await this.microsoftOAuth2ClientManagerService.getOAuth2Client(
        connectedAccount.refreshToken,
      );

    const { mailFolders, syncToken: mailFolderSyncToken } =
      await this.getMailFolders(microsoftClient);

    const messageIdsToFetch: string[] = [];

    for (const mailFolder of mailFolders) {
      const response: PageCollection = await microsoftClient
        .api(`/me/mailFolders/${mailFolder}/messages/delta`)
        .select('id')
        .get();

      const callback: PageIteratorCallback = (data: { id: string }) => {
        messageIdsToFetch.push(mailFolder + '/' + data.id);

        return true;
      };

      const pageIterator = new PageIterator(
        microsoftClient,
        response,
        callback,
      );

      await pageIterator.iterate();

      // pageIterator.getDeltaLink();
    }

    return {
      messageExternalIds: messageIdsToFetch,
      nextSyncCursor: mailFolderSyncToken || '',
    };
  }

  public async getPartialMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor: string,
  ): Promise<GetPartialMessageListResponse> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    const { history, historyId: nextSyncCursor } =
      await this.gmailGetHistoryService.getHistory(gmailClient, syncCursor);

    const { messagesAdded, messagesDeleted } =
      await this.gmailGetHistoryService.getMessageIdsFromHistory(history);

    if (!nextSyncCursor) {
      throw new MessageImportDriverException(
        `No nextSyncCursor found for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    return {
      messageExternalIds: messagesAdded,
      messageExternalIdsToDelete: messagesDeleted,
      nextSyncCursor,
    };
  }

  private async getMailFolders(microsoftClient: Client) {
    const mailFolders: string[] = [];

    const response: PageCollection = await microsoftClient
      .api('/me/mailFolders/delta')
      .select('id')
      .get();

    const callback: PageIteratorCallback = (data: MailFolder) => {
      if (data.id) {
        mailFolders.push(data.id);
      }

      return true;
    };

    const pageIterator = new PageIterator(microsoftClient, response, callback);

    await pageIterator.iterate();

    return {
      mailFolders,
      syncToken: pageIterator.getDeltaLink(),
    };
  }
}
