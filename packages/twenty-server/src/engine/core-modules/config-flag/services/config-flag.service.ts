import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/config-flag/interfaces/config-flag-map.interface';

import { ConfigFlagEntity } from 'src/engine/core-modules/config-flag/config-flag.entity';
import {
  ConfigKey,
  FeatureFlagKey,
} from 'src/engine/core-modules/config-flag/enums/config-key.enum';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

const ServerLevelConfigKey = '*';

@Injectable()
export class ConfigFlagService {
  constructor(
    @InjectRepository(ConfigFlagEntity, 'core')
    private readonly configFlagRepository: Repository<ConfigFlagEntity>,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async get(key: ConfigKey, workspaceId: string) {
    // Workspace
    const workspaceConfigFlag = await this.configFlagRepository.findOneBy({
      workspaceId,
      key,
    });

    if (workspaceConfigFlag) {
      return workspaceConfigFlag?.value;
    }

    // Server Config
    const serverConfigFlag = await this.configFlagRepository.findOneBy({
      workspaceId: ServerLevelConfigKey,
      key,
    });

    if (workspaceConfigFlag) {
      return workspaceConfigFlag?.value;
    }

    // Enviroment
    this.environmentService.get(key);


    return workspaceConfigFlag?.value;
  }

  public async isFeatureEnabled(
    key: FeatureFlagKey,
    workspaceId: string,
  ): Promise<boolean> {
    const featureFlag = await this.configFlagRepository.findOneBy({
      workspaceId,
      key,
      value: true,
    });

    return !!featureFlag?.value;
  }

  public async getWorkspaceFeatureFlags(
    workspaceId: string,
  ): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags = await this.configFlagRepository.find({
      where: { workspaceId },
    });

    const workspaceFeatureFlagsMap = workspaceFeatureFlags.reduce(
      (result, currentFeatureFlag) => {
        result[currentFeatureFlag.key] = currentFeatureFlag.value;

        return result;
      },
      {} as FeatureFlagMap,
    );

    return workspaceFeatureFlagsMap;
  }
}
