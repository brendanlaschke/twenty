import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';

import { withMultiColumn } from '@blocknote/xl-multi-column';
import { FileBlock } from '../components/FileBlock';

export const BLOCK_SCHEMA = withMultiColumn(
  BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      file: FileBlock,
    },
  }),
);
