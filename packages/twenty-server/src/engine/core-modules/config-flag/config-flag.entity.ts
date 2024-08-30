import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  ConfigKey,
  FeatureFlagKey,
} from 'src/engine/core-modules/config-flag/enums/config-key.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'configFlag', schema: 'core' })
@ObjectType('ConfigFlag')
@Unique('IndexOnKeyAndWorkspaceIdUnique', ['key', 'workspaceId'])
export class ConfigFlagEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ nullable: false, type: 'text' })
  key: FeatureFlagKey | ConfigKey;

  @Field()
  @Column({ nullable: true, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.featureFlags, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  workspace: Relation<Workspace>;

  @Field()
  @Column({ nullable: true })
  FEATURE_FLAG: boolean;

  @Field()
  @Column({ nullable: true })
  alert_banner: string;

  @Field()
  @Column({ nullable: true })
  config_value: string;

  @Field()
  @Column({ nullable: true })
  config_value_secret: string;
}
