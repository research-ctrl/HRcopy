# Source Governance

## Purpose
The assistant must only use approved external sources. This repository treats source governance as a primary domain, not an implementation detail.

## Governance states
- `draft`: proposed but not approved for assistant use
- `active`: approved, allowlisted, and monitored
- `inactive`: excluded from monitoring and retrieval

## Retrieval rules
- Web-backed content must be both `allowlisted` and `approved`.
- Retrieval filters out inactive sources and pending sources.
- Document chunks must also be approved before they are eligible.

## Monitoring posture
- Daily checks are represented by monitoring runs and digests.
- Severity should reflect content drift or legal significance.
- Major changes should feed a human review queue before those sources affect answers.

## Future controls
- Domain-level allowlisting
- Path-level scoping
- Content fingerprinting
- Change diff review
- Approval and rollback history
