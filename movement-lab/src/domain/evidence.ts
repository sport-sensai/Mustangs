import type { EvidenceRecord } from './types';

// Only sources named in the PRD (§21) are cited. Anatomy and coaching text in
// this prototype is draft content: it has NOT been source-mapped or reviewed, and
// the UI says so rather than inventing citations (AI-03).
export const CONTENT_VERSION = 'content-0.1.0-draft';

export const EVIDENCE: Record<string, EvidenceRecord> = {
  'ev-draft-anatomy': {
    id: 'ev-draft-anatomy',
    claim: 'General anatomy and phase-role descriptions shown on structure and phase cards',
    source: 'Draft educational content written for the prototype',
    evidenceType: 'pending',
    applicability: 'Generic modeled body only; educational orientation',
    limitations:
      'Not yet mapped to a textbook or peer-reviewed source and not reviewed by an anatomy or coaching reviewer. Treat as a draft to be verified.',
    contentVersion: CONTENT_VERSION,
  },
  'ev-opensim-workflows': {
    id: 'ev-opensim-workflows',
    claim:
      'Musculoskeletal estimates (joint moments, muscle forces) depend on distinct workflows and model/data assumptions; visible motion alone does not establish them',
    source: 'Overview of OpenSim Workflows',
    publisher: 'OpenSim project (Stanford)',
    url: 'https://opensimconfluence.atlassian.net/wiki/spaces/OpenSim/pages/53084226/Overview%20of%20OpenSim%20Workflows',
    evidenceType: 'technical-documentation',
    applicability: 'Boundary between animation and mechanics outputs',
    limitations: 'Feasibility reference only; not a committed integration or an endorsement.',
    contentVersion: CONTENT_VERSION,
  },
  'ev-opensim-id': {
    id: 'ev-opensim-id',
    claim:
      'Inverse dynamics requires measured kinematics plus external forces (e.g. ground reaction forces) and a scaled model',
    source: 'Tutorial 3 – Scaling, Inverse Kinematics, and Inverse Dynamics',
    publisher: 'OpenSim project (Stanford)',
    url: 'https://opensimconfluence.atlassian.net/wiki/spaces/OpenSim/pages/53089741/Tutorial%2B3%2B-%2BScaling%2C%2BInverse%2BKinematics%2C%2Band%2BInverse%2BDynamics',
    evidenceType: 'technical-documentation',
    applicability: 'Why forces are "not calculated" for the keyed prototype clips',
    limitations: 'Describes OpenSim workflows; the prototype does not run OpenSim.',
    contentVersion: CONTENT_VERSION,
  },
  'ev-anatomy-trains': {
    id: 'ev-anatomy-trains',
    claim: 'Myofascial meridians describe proposed whole-body continuities (e.g. Superficial Back Line)',
    source: 'Anatomy Trains – About Us',
    publisher: 'Anatomy Trains',
    url: 'https://www.anatomytrains.com/about-us/',
    evidenceType: 'framework-description',
    applicability: 'Fascial lens overlay — an attributed interpretive framework',
    limitations:
      'Describes the framework; it does not verify that any line transmits a quantified load in a given movement. No affiliation or endorsement implied.',
    contentVersion: CONTENT_VERSION,
  },
};
