import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PubSub } from 'graphql-subscriptions';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';

@Injectable()
export class EventsListener {
  constructor(@Inject('PubSub') private readonly pubSub: PubSub) {}

  @OnEvent('*.created')
  async handleObjectRecordCreateEvent(payload: ObjectRecordCreateEvent<any>) {
    return this.pubSub.publish('recordCreated', {
      recordCreated: payload,
    });
  }

  @OnEvent('*.updated')
  async handleObjectRecordUpdateEvent(payload: ObjectRecordUpdateEvent<any>) {
    return this.pubSub.publish('recordUpdated', {
      recordUpdated: payload,
    });
  }

  @OnEvent('*.deleted')
  async handleObjectRecordDeleteEvent(payload: ObjectRecordDeleteEvent<any>) {
    return this.pubSub.publish('recordDeleted', {
      recordDeleted: payload,
    });
  }
}
