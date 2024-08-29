import { Inject } from '@nestjs/common';
import { Resolver, Subscription } from '@nestjs/graphql';

import { PubSub } from 'graphql-subscriptions';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';

@Resolver()
export class SubscriptionResolver {
  constructor(@Inject('PubSub') private readonly pubSub: PubSub) {}

  @Subscription(() => ObjectRecordCreateEvent, {
    filter(this: SubscriptionResolver, payload, variables) {
      return true;
    },
  })
  recordCreated() {
    return this.pubSub.asyncIterator('recordCreated');
  }

  @Subscription(() => ObjectRecordUpdateEvent)
  recordUpdated() {
    return this.pubSub.asyncIterator('recordUpdated');
  }

  @Subscription(() => ObjectRecordDeleteEvent)
  recordDeleted() {
    return this.pubSub.asyncIterator('recordDeleted');
  }
}
