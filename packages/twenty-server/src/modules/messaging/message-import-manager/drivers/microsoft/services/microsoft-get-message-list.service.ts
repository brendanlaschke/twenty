import { Injectable } from '@nestjs/common';

import {
  Client,
  PageCollection,
  PageIterator,
  PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';
import { MailFolder } from '@microsoft/microsoft-graph-types';
import { gmail_v1 as gmailV1 } from 'googleapis';

import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MESSAGING_GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-categories';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';
import { computeGmailCategoryExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-excude-search-filter.util';
import { computeGmailCategoryLabelId } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-label-id.util';
import {
  GetFullMessageListResponse,
  GetPartialMessageListResponse,
} from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import { assertNotNull } from 'src/utils/assert';

@Injectable()
export class MicrosoftGetMessageListService {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly gmailGetHistoryService: GmailGetHistoryService,
    private readonly gmailHandleErrorService: GmailHandleErrorService,
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

    const messageIdsToFetch: { mailFolder: string; messageId: string }[] = [];

    for (const mailFolder of mailFolders) {
      const response: PageCollection = await microsoftClient
        .api(`/me/mailFolders/${mailFolder}/messages/delta`)
        .select('id')
        .get();

      const callback: PageIteratorCallback = (data: { id: string }) => {
        messageIdsToFetch.push({ mailFolder, messageId: data.id });

        return true;
      };

      const pageIterator = new PageIterator(
        microsoftClient,
        response,
        callback,
      );

      await pageIterator.iterate();
    }

    return { messageExternalIds, nextSyncCursor };
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

    const messageIdsToFilter = await this.getEmailIdsFromExcludedCategories(
      gmailClient,
      syncCursor,
    );

    const messagesAddedFiltered = messagesAdded.filter(
      (messageId) => !messageIdsToFilter.includes(messageId),
    );

    if (!nextSyncCursor) {
      throw new MessageImportDriverException(
        `No nextSyncCursor found for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    return {
      messageExternalIds: messagesAddedFiltered,
      messageExternalIdsToDelete: messagesDeleted,
      nextSyncCursor,
    };
  }

  private async getEmailIdsFromExcludedCategories(
    gmailClient: gmailV1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<string[]> {
    const emailIds: string[] = [];

    for (const category of MESSAGING_GMAIL_EXCLUDED_CATEGORIES) {
      const { history } = await this.gmailGetHistoryService.getHistory(
        gmailClient,
        lastSyncHistoryId,
        ['messageAdded'],
        computeGmailCategoryLabelId(category),
      );

      const emailIdsFromCategory = history
        .map((history) => history.messagesAdded)
        .flat()
        .map((message) => message?.message?.id)
        .filter((id) => id)
        .filter(assertNotNull);

      emailIds.push(...emailIdsFromCategory);
    }

    return emailIds;
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
