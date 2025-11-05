/**
 * AI Agent Action Chain
 *
 * Chains actions together and executes them sequentially.
 * Handles action dependencies, error recovery, and permission checks.
 */

import {
  AgentAction,
  ActionPlan,
  updateActionStatus,
  updatePlan,
  getNextAction,
  isPlanComplete,
} from './agent-actions';
import { ActionExecutor } from './agent-action-executor';
import { needsPermission, PermissionRequest, PermissionResponse } from './agent-permissions';
import { announceAction } from './agent-action-messages';

export interface ActionChainOptions {
  executor: ActionExecutor;
  consultantId?: string;
  onActionStart?: (action: AgentAction) => void;
  onActionProgress?: (action: AgentAction, progress: string) => void;
  onActionComplete?: (action: AgentAction) => void;
  onActionFailed?: (action: AgentAction, error: string) => void;
  onPermissionRequired?: (action: AgentAction, request: PermissionRequest) => Promise<PermissionResponse>;
  onPlanComplete?: (plan: ActionPlan) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ActionChainResult {
  plan: ActionPlan;
  completedActions: AgentAction[];
  failedActions: AgentAction[];
  skippedActions: AgentAction[];
  success: boolean;
  error?: string;
}

/**
 * Execute a chain of actions
 */
export async function executeActionChain(
  plan: ActionPlan,
  options: ActionChainOptions
): Promise<ActionChainResult> {
  const {
    executor,
    consultantId = 'sarah-flight',
    onActionStart,
    onActionProgress,
    onActionComplete,
    onActionFailed,
    onPermissionRequired,
    onPlanComplete,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const completedActions: AgentAction[] = [];
  const failedActions: AgentAction[] = [];
  const skippedActions: AgentAction[] = [];

  let currentPlan: ActionPlan = { ...plan, status: 'in-progress' };

  try {
    while (!isPlanComplete(currentPlan)) {
      const action = getNextAction(currentPlan);

      if (!action) {
        break;
      }

      // Check if permission is needed
      const permissionRequest = needsPermission(action);

      if (permissionRequest && !plan.autoExecute) {
        // Stop and ask for permission
        const updatedAction = updateActionStatus(action, 'waiting-permission');
        onActionStart?.(updatedAction);

        if (onPermissionRequired) {
          try {
            const permissionResponse = await onPermissionRequired(action, permissionRequest);

            if (!permissionResponse.granted) {
              // Permission denied - skip this action
              const deniedAction = updateActionStatus(
                action,
                'skipped',
                undefined,
                permissionResponse.reason || 'Permission denied'
              );
              skippedActions.push(deniedAction);

              // Update plan
              currentPlan = updatePlan(currentPlan, {
                currentActionIndex: currentPlan.currentActionIndex + 1,
              });

              continue;
            }
          } catch (error) {
            // Permission check failed
            const errorAction = updateActionStatus(
              action,
              'failed',
              undefined,
              error instanceof Error ? error.message : 'Permission check failed'
            );
            failedActions.push(errorAction);
            break;
          }
        } else {
          // No permission handler - stop execution
          const stoppedAction = updateActionStatus(action, 'skipped', undefined, 'Awaiting permission');
          skippedActions.push(stoppedAction);
          break;
        }
      }

      // Execute the action
      const result = await executeActionWithRetry(
        action,
        executor,
        consultantId,
        {
          onStart: onActionStart,
          onProgress: onActionProgress,
          onComplete: onActionComplete,
          onFailed: onActionFailed,
        },
        maxRetries,
        retryDelay
      );

      // Check result
      if (result.status === 'completed') {
        completedActions.push(result);

        // Update plan
        currentPlan = updatePlan(currentPlan, {
          currentActionIndex: currentPlan.currentActionIndex + 1,
        });

        // Pass result to next action if needed
        if (currentPlan.currentActionIndex < currentPlan.actions.length) {
          const nextAction = currentPlan.actions[currentPlan.currentActionIndex];
          if (nextAction && shouldPassResult(action, nextAction)) {
            nextAction.params = {
              ...nextAction.params,
              previousResult: result.result,
            };
          }
        }
      } else if (result.status === 'failed') {
        failedActions.push(result);

        // Decide whether to continue or stop
        if (isActionCritical(action)) {
          // Critical action failed - stop execution
          currentPlan = updatePlan(currentPlan, {
            status: 'failed',
          });
          break;
        } else {
          // Non-critical action failed - continue with next action
          currentPlan = updatePlan(currentPlan, {
            currentActionIndex: currentPlan.currentActionIndex + 1,
          });
        }
      } else {
        // Action was skipped or in unexpected state
        skippedActions.push(result);
        currentPlan = updatePlan(currentPlan, {
          currentActionIndex: currentPlan.currentActionIndex + 1,
        });
      }
    }

    // Mark plan as complete
    if (isPlanComplete(currentPlan)) {
      currentPlan = updatePlan(currentPlan, {
        status: failedActions.length > 0 && completedActions.length === 0 ? 'failed' : 'completed',
        completedAt: new Date(),
      });

      onPlanComplete?.(currentPlan);
    }

    return {
      plan: currentPlan,
      completedActions,
      failedActions,
      skippedActions,
      success: failedActions.length === 0 && completedActions.length > 0,
    };
  } catch (error) {
    // Unexpected error during chain execution
    return {
      plan: updatePlan(currentPlan, {
        status: 'failed',
        completedAt: new Date(),
      }),
      completedActions,
      failedActions,
      skippedActions,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute a single action with retry logic
 */
async function executeActionWithRetry(
  action: AgentAction,
  executor: ActionExecutor,
  consultantId: string,
  callbacks: {
    onStart?: (action: AgentAction) => void;
    onProgress?: (action: AgentAction, progress: string) => void;
    onComplete?: (action: AgentAction) => void;
    onFailed?: (action: AgentAction, error: string) => void;
  },
  maxRetries: number,
  retryDelay: number
): Promise<AgentAction> {
  const { onStart, onProgress, onComplete, onFailed } = callbacks;

  let lastError: string | undefined;
  let currentRetry = 0;

  // Announce action start
  const startMessage = announceAction(action.type, 'start', consultantId);
  const executingAction = updateActionStatus(action, 'executing');
  onStart?.(executingAction);

  while (currentRetry <= maxRetries) {
    try {
      // Announce progress if retrying
      if (currentRetry > 0) {
        const progressMessage = announceAction(action.type, 'progress', consultantId);
        onProgress?.(executingAction, `Retry ${currentRetry}/${maxRetries}: ${progressMessage}`);
      } else {
        const progressMessage = announceAction(action.type, 'progress', consultantId);
        onProgress?.(executingAction, progressMessage);
      }

      // Execute the action
      const result = await executor.execute(action);

      if (result.status === 'completed') {
        // Success!
        const successMessage = announceAction(action.type, 'success', consultantId, {
          count: result.result?.count || result.result?.length || 0,
          total: result.result?.total || 0,
          bookingId: result.result?.bookingId || '',
        });
        onComplete?.(result);

        return result;
      } else {
        // Action failed
        lastError = result.error || 'Unknown error';

        // Check if retryable
        if (isRetryable(action, result) && currentRetry < maxRetries) {
          currentRetry++;
          await sleep(retryDelay * currentRetry); // Exponential backoff
          continue;
        } else {
          // Not retryable or max retries reached
          const failureMessage = announceAction(action.type, 'failure', consultantId);
          onFailed?.(result, lastError);
          return result;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';

      // Check if should retry
      if (currentRetry < maxRetries && action.metadata?.retryable !== false) {
        currentRetry++;
        await sleep(retryDelay * currentRetry);
        continue;
      } else {
        // Max retries reached or not retryable
        const failedAction = updateActionStatus(action, 'failed', undefined, lastError);
        const failureMessage = announceAction(action.type, 'failure', consultantId);
        onFailed?.(failedAction, lastError);
        return failedAction;
      }
    }
  }

  // Should never reach here, but just in case
  const failedAction = updateActionStatus(action, 'failed', undefined, lastError);
  onFailed?.(failedAction, lastError || 'Max retries exceeded');
  return failedAction;
}

/**
 * Check if action should be retried
 */
function isRetryable(action: AgentAction, result: AgentAction): boolean {
  // Don't retry if explicitly marked as not retryable
  if (action.metadata?.retryable === false) {
    return false;
  }

  // Don't retry booking/payment actions
  if (['book', 'verify-payment'].includes(action.type)) {
    return false;
  }

  // Don't retry if error indicates a permanent failure
  const error = result.error?.toLowerCase() || '';
  if (
    error.includes('not found') ||
    error.includes('invalid') ||
    error.includes('unauthorized') ||
    error.includes('permission denied')
  ) {
    return false;
  }

  // Retry for network/timeout errors
  if (
    error.includes('timeout') ||
    error.includes('network') ||
    error.includes('connection') ||
    error.includes('unavailable')
  ) {
    return true;
  }

  // Default: retry unless max retries reached
  const currentRetries = action.metadata?.retryCount || 0;
  const maxRetries = action.metadata?.maxRetries || 3;
  return currentRetries < maxRetries;
}

/**
 * Check if action is critical (failure should stop the chain)
 */
function isActionCritical(action: AgentAction): boolean {
  // Booking actions are critical
  if (['book', 'verify-payment'].includes(action.type)) {
    return true;
  }

  // Check metadata
  if (action.metadata?.priority === 'high') {
    return true;
  }

  // Check if explicitly marked as critical
  if (action.params?.critical === true) {
    return true;
  }

  return false;
}

/**
 * Check if result should be passed to next action
 */
function shouldPassResult(currentAction: AgentAction, nextAction: AgentAction): boolean {
  // Pass search results to comparison
  if (currentAction.type.includes('search') && nextAction.type === 'compare-options') {
    return true;
  }

  // Pass comparison to calculate total
  if (currentAction.type === 'compare-options' && nextAction.type === 'calculate-total') {
    return true;
  }

  // Pass add-to-cart to calculate total
  if (currentAction.type === 'add-to-cart' && nextAction.type === 'calculate-total') {
    return true;
  }

  // Pass availability check to booking
  if (currentAction.type === 'check-availability' && nextAction.type === 'book') {
    return true;
  }

  // Pass calculate total to booking
  if (currentAction.type === 'calculate-total' && nextAction.type === 'book') {
    return true;
  }

  return false;
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute actions in parallel (for independent actions)
 */
export async function executeActionsParallel(
  actions: AgentAction[],
  executor: ActionExecutor,
  consultantId: string = 'sarah-flight'
): Promise<AgentAction[]> {
  const promises = actions.map((action) =>
    executeActionWithRetry(
      action,
      executor,
      consultantId,
      {}, // No callbacks for parallel execution
      3, // maxRetries
      1000 // retryDelay
    )
  );

  return Promise.all(promises);
}

/**
 * Create a sub-chain for conditional execution
 */
export function createSubChain(
  condition: (result: any) => boolean,
  actionsIfTrue: AgentAction[],
  actionsIfFalse: AgentAction[]
): AgentAction[] {
  // This would be implemented based on the condition evaluation
  // For now, return a placeholder
  return actionsIfTrue;
}

/**
 * Merge multiple action chains
 */
export function mergeActionChains(...plans: ActionPlan[]): ActionPlan {
  const allActions = plans.flatMap((plan) => plan.actions);

  return {
    id: `merged_${Date.now()}`,
    actions: allActions,
    currentActionIndex: 0,
    autoExecute: plans.every((plan) => plan.autoExecute),
    userIntent: plans.map((plan) => plan.userIntent).join('; '),
    createdAt: new Date(),
    status: 'pending',
  };
}

/**
 * Get action chain summary
 */
export function getChainSummary(result: ActionChainResult): string {
  const total = result.plan.actions.length;
  const completed = result.completedActions.length;
  const failed = result.failedActions.length;
  const skipped = result.skippedActions.length;

  return `Completed ${completed}/${total} actions (${failed} failed, ${skipped} skipped)`;
}
