import { Scope } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowVersionId: string;
  workflowRunId: string;
  payload: object;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class RunWorkflowJob {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowExecutorWorkspaceService: WorkflowExecutorWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly throttlerService: ThrottlerService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Process(RunWorkflowJob.name)
  async handle({
    workflowVersionId,
    workflowRunId,
    payload,
  }: RunWorkflowJobData): Promise<void> {
    const context = {
      trigger: payload,
    };

    try {
      const workflowVersion =
        await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
          workflowVersionId,
        );

      if (!workflowVersion.trigger || !workflowVersion.steps) {
        throw new WorkflowRunException(
          'Workflow version has no trigger or steps',
          WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
        );
      }

      await this.workflowRunWorkspaceService.startWorkflowRun({
        workflowRunId,
        context,
        output: {
          flow: {
            trigger: workflowVersion.trigger,
            steps: workflowVersion.steps,
          },
        },
      });

      await this.throttleExecution(workflowVersion.workflowId);

      const { error, pendingEvent } =
        await this.workflowExecutorWorkspaceService.execute({
          workflowRunId,
          currentStepIndex: 0,
          steps: workflowVersion.steps,
          context,
        });

      if (pendingEvent) {
        return;
      }

      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        status: error ? WorkflowRunStatus.FAILED : WorkflowRunStatus.COMPLETED,
        error,
      });
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        status: WorkflowRunStatus.FAILED,
        error: error.message,
      });
    }
  }

  private async throttleExecution(workflowId: string) {
    try {
      await this.throttlerService.throttle(
        `${workflowId}-workflow-execution`,
        this.environmentService.get('WORKFLOW_EXEC_THROTTLE_LIMIT'),
        this.environmentService.get('WORKFLOW_EXEC_THROTTLE_TTL'),
      );
    } catch (error) {
      throw new WorkflowRunException(
        'Workflow execution rate limit exceeded',
        WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED,
      );
    }
  }
}
