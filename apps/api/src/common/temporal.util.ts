export function toTemporalInstant(isoDateString: string): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(new Date(isoDateString).getTime());
}
