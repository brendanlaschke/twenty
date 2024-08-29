import { Module } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';

import { EventsListener } from 'src/engine/subscriptions/events.listener';
import { SubscriptionResolver } from 'src/engine/subscriptions/subscriptions.resolver';

@Module({
  imports: [],
  exports: [],
  providers: [
    {
      provide: 'PubSub',
      useFactory: () => {
        return new PubSub();
      },
    },
    SubscriptionResolver,
    EventsListener,
  ],
})
export class SubscriptionModule {}
