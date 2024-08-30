import { FeatureFlagKey } from 'src/engine/core-modules/config-flag/enums/config-key.enum';

export type FeatureFlagMap = Record<`${FeatureFlagKey}`, boolean>;
