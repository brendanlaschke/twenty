import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ConfigFlagEntity } from 'src/engine/core-modules/config-flag/config-flag.entity';
import { ConfigFlagService } from 'src/engine/core-modules/config-flag/services/config-flag.service';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([ConfigFlagEntity], 'core'),
      ],
      services: [],
      resolvers: [],
    }),
    EnvironmentModule,
  ],
  exports: [ConfigFlagService],
  providers: [ConfigFlagService],
})
export class ConfigFlagModule {}
