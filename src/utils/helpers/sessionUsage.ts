import type {SessionDetail} from '../../services/models/response/UseResrService';

export function getSharedSessionUsage(
  sessions: SessionDetail[] | undefined,
  viewerId: number | undefined,
  ownerId: number | undefined,
) {
  if (viewerId == null || !sessions?.length) return null;

  let mine = 0;
  let others = 0;
  let shared = ownerId != null && ownerId !== viewerId;
  for (const {consumer, quantity} of sessions) {
    if (
      consumer?.id == null ||
      quantity == null ||
      !Number.isFinite(quantity)
    ) {
      return null;
    }
    if (consumer.id === viewerId) {
      mine += quantity;
    } else {
      others += quantity;
      shared = true;
    }
  }
  return shared ? {mine, others} : null;
}
