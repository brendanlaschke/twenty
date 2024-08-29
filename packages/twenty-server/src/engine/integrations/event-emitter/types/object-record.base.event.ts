import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

@ObjectType()
export class ObjectRecordBaseEvent {
  @Field(() => String)
  recordId: string;

  @Field(() => String)
  userId?: string;

  @Field(() => String)
  workspaceMemberId?: string;

  // TODO
  @Field(() => GraphQLJSON)
  objectMetadata: ObjectMetadataInterface;

  properties: any;
}

export class ObjectRecordBaseEventWithNameAndWorkspaceId extends ObjectRecordBaseEvent {
  name: string;
  workspaceId: string;
}
