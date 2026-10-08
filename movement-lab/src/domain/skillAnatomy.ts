import type { AnatomicalStructure, PhaseRole } from './types';

// Draft content for the baseball skills (swing, pitch, catcher throw). Roles are
// educational descriptions of possible contributions in the generic modeled
// clip, not measured activation. Awaiting anatomy and coaching review.

const D = 'educational-draft' as const;
const r = (role: string): PhaseRole => ({ role, basis: D });
const DRAFT = ['ev-draft-anatomy'];

export const SKILL_STRUCTURES: AnatomicalStructure[] = [
  {
    id: 'rotator-cuff',
    name: 'Rotator cuff',
    aliases: ['rotator cuff', 'cuff', 'supraspinatus', 'infraspinatus', 'teres minor', 'subscapularis'],
    type: 'muscle',
    layer: 'muscles',
    side: 'bilateral',
    meshIds: ['m-cuff-l', 'm-cuff-r'],
    whatItIs: 'Four deep muscles from the scapula to the humeral head that help keep the ball of the shoulder centred in its socket.',
    attachments: 'Scapula (supraspinous, infraspinous and subscapular fossae; lateral border) → greater and lesser tubercles of the humerus.',
    crosses: ['shoulder'],
    commonActions: ['Shoulder rotation (internal and external)', 'Compressing and centring the humeral head'],
    roles: {},
    limitations: 'Represented as one deep band per side. Individual muscles, tendon loads and labral contact are not modeled.',
    evidenceIds: DRAFT,
    review: 'draft',
  },
  {
    id: 'pectoralis-major',
    name: 'Pectoralis major',
    aliases: ['pec', 'pecs', 'pectoralis', 'chest'],
    type: 'muscle',
    layer: 'muscles',
    side: 'bilateral',
    meshIds: ['m-pec-l', 'm-pec-r'],
    whatItIs: 'The large fan-shaped chest muscle connecting the sternum, clavicle and ribs to the upper humerus.',
    attachments: 'Clavicle, sternum and upper costal cartilages → lateral lip of the intertubercular groove of the humerus.',
    crosses: ['shoulder'],
    commonActions: ['Shoulder horizontal adduction', 'Internal rotation', 'Flexion (clavicular part)'],
    roles: {},
    limitations: 'One simplified band per side.',
    evidenceIds: DRAFT,
    review: 'draft',
  },
  {
    id: 'forearm-flexors',
    name: 'Flexor–pronator group (forearm)',
    aliases: ['forearm flexors', 'flexor pronator', 'wrist flexors', 'forearm', 'pronator teres', 'fcu', 'flexor carpi ulnaris'],
    type: 'muscle',
    layer: 'muscles',
    side: 'bilateral',
    meshIds: ['m-flexors-l', 'm-flexors-r'],
    whatItIs: 'Muscles arising from the inner (medial) elbow that flex the wrist and fingers and pronate the forearm.',
    attachments: 'Medial epicondyle of the humerus (common flexor origin) → wrist, hand and radius.',
    crosses: ['elbow', 'wrist'],
    commonActions: ['Wrist and finger flexion', 'Forearm pronation', 'Commonly discussed as dynamic support for the medial elbow'],
    roles: {},
    limitations: 'Grouped. The wrist and fingers are not modeled, so wrist motion is not shown.',
    evidenceIds: DRAFT,
    review: 'draft',
  },
  {
    id: 'ucl',
    name: 'Ulnar collateral ligament (UCL, elbow)',
    aliases: ['ucl', 'ulnar collateral ligament', 'tommy john', 'medial collateral ligament of the elbow', 'elbow ligament'],
    type: 'ligament',
    layer: 'ligaments',
    side: 'bilateral',
    meshIds: ['l-ucl-l', 'l-ucl-r'],
    whatItIs: 'A ligament on the inner side of the elbow connecting the humerus to the ulna.',
    attachments: 'Medial epicondyle of the humerus → sublime tubercle of the ulna (anterior bundle).',
    roles: {},
    limitations:
      'Schematic position only. UCL load (elbow varus torque) is not calculated. It needs inverse dynamics with measured arm motion, so it cannot be read from this animation (ANAT-04).',
    evidenceIds: DRAFT,
    review: 'draft',
  },
  {
    id: 'elbow-joint',
    name: 'Elbow joint',
    aliases: ['elbow', 'humeroulnar joint'],
    type: 'joint',
    layer: 'joints',
    side: 'bilateral',
    meshIds: ['j-elbow-l', 'j-elbow-r'],
    whatItIs: 'Hinge joint between the humerus and the ulna (with the radius), allowing flexion and extension; forearm rotation happens nearby.',
    roles: {},
    limitations: 'Modeled as a hinge solved by IK; forearm pronation/supination is not modeled.',
    evidenceIds: DRAFT,
    review: 'draft',
  },
];

type RoleTable = Record<string, Record<string, Record<string, PhaseRole>>>;

/** structureId → movementId → phaseId (or '*') → role */
export const SKILL_ROLES: RoleTable = {
  'gluteus-maximus': {
    'baseball-swing': {
      stance: r('Contributes to the hip-hinged athletic posture.'),
      load: r('Back-side glute helps control the shift into the back hip.'),
      launch: r('Contributes to hip extension and rotation that start the swing from the ground up.'),
      '*': r('Contributes to hip control and rotation throughout the swing.'),
    },
    'baseball-pitch': {
      set: r('Contributes to an upright, balanced posture on the rubber.'),
      legLift: r('Stance-side glute helps stabilise the pelvis on one leg.'),
      stride: r('Back-leg hip extension and abduction contribute to driving the body toward the plate.'),
      followThrough: r('Helps decelerate the trunk and control the landing.'),
      '*': r('Contributes to pelvic control and hip extension.'),
    },
    'catcher-throw': {
      receive: r('Lengthened in the deep squat; contributes to holding the position.'),
      transfer: r('Contributes to hip extension as the catcher rises out of the squat.'),
      '*': r('Contributes to hip extension and pelvic control.'),
    },
  },
  'adductor-magnus': {
    'baseball-swing': { load: r('Back-side adductors contribute to controlling the hip as weight shifts back.'), stride: r('Contribute to controlling the stride and front-hip landing.'), '*': r('Contributes to pelvic control in the wide stance.') },
    'baseball-pitch': { stride: r('Contributes to controlling the wide stride position.'), '*': r('Contributes to hip control between the stance and stride legs.') },
    'catcher-throw': { receive: r('Lengthened in the wide squat.'), transfer: r('Contributes to rising out of the wide squat.'), '*': r('Contributes to hip control in the wide base.') },
  },
  'rectus-abdominis': {
    'baseball-swing': {
      load: r('Obliques are stretched as the trunk coils away from the pitcher.'),
      stride: r('Trunk wall is stretched as the pelvis begins to open while the shoulders stay closed (separation).'),
      launch: r('Obliques contribute to transferring pelvis rotation up to the trunk.'),
      contact: r('Contributes to trunk stiffness as the bat meets the ball.'),
      '*': r('Contributes to trunk rotation and stiffness.'),
    },
    'baseball-pitch': {
      cocking: r('Trunk wall is stretched as the pelvis rotates ahead of the shoulders.'),
      acceleration: r('Contributes to rapid trunk rotation and forward flexion toward the plate.'),
      '*': r('Contributes to trunk control during the delivery.'),
    },
    'catcher-throw': { stride: r('Stretched as the hips open ahead of the closed shoulders.'), acceleration: r('Contributes to trunk rotation into the throw.'), '*': r('Contributes to trunk control.') },
  },
  'erector-spinae': {
    'baseball-swing': { '*': r('Contributes to maintaining spine angle (posture over the plate) while rotating.') },
    'baseball-pitch': { '*': r('Contributes to posture and, after release, to controlling trunk flexion.') },
    'catcher-throw': { '*': r('Contributes to holding the trunk as the catcher rises and rotates.') },
  },
  'latissimus-dorsi': {
    'baseball-swing': { stride: r('Lengthened as the hands stay back while the hips start to turn.'), launch: r('Lead-arm lat contributes to pulling the knob of the bat toward the ball.'), '*': r('Links the arms to the trunk and pelvis through the thoracolumbar fascia.') },
    'baseball-pitch': { cocking: r('Lengthened as the arm lays back.'), acceleration: r('Contributes to shoulder internal rotation and extension as the arm drives forward.'), deceleration: r('Contributes to slowing the arm after release.'), '*': r('Links the throwing arm to the trunk.') },
    'catcher-throw': { acceleration: r('Contributes to driving the arm forward.'), '*': r('Links the throwing arm to the trunk.') },
  },
  deltoid: {
    'baseball-swing': { '*': r('Contributes to positioning the arms and hands.') },
    'baseball-pitch': { cocking: r('Contributes to raising the arm to shoulder height for the cocked position.'), '*': r('Contributes to arm elevation.') },
    'catcher-throw': { stride: r('Contributes to lifting the arm quickly to the ear.'), '*': r('Contributes to arm elevation.') },
  },
  quadriceps: {
    'baseball-swing': { launch: r('Front-leg quads contribute to bracing as the front knee extends.'), contact: r('Contributes to a firm front leg the hips can rotate over.'), '*': r('Contributes to knee control in the athletic stance.') },
    'baseball-pitch': { cocking: r('Lead-leg quads contribute to accepting load at foot contact.'), acceleration: r('Contributes to the lead knee firming up so the trunk can rotate over it.'), '*': r('Contributes to knee control.') },
    'catcher-throw': { receive: r('Lengthened in the deep squat; contributes to holding it.'), transfer: r('Contributes to knee extension when rising.'), '*': r('Contributes to knee control.') },
  },
  hamstrings: {
    'baseball-pitch': { stride: r('Contribute to hip extension of the drive leg.'), deceleration: r('Lead-leg hamstrings lengthen as the trunk flexes over the front leg.'), '*': r('Contribute to hip and knee control.') },
    'catcher-throw': { followThrough: r('Contribute to controlling trunk flexion over the front leg.'), '*': r('Contribute to hip and knee control.') },
    'baseball-swing': { '*': r('Contribute to hip-hinged posture and hip extension.') },
  },
  'calf-complex': {
    'baseball-pitch': { legLift: r('Stance-leg calf contributes to balance on one foot.'), '*': r('Contributes to ankle control.') },
    'catcher-throw': { receive: r('Supports the catcher on the balls of the feet.'), '*': r('Contributes to ankle control.') },
    'baseball-swing': { '*': r('Contributes to balance; back calf as the back heel rises.') },
  },
  iliopsoas: {
    'baseball-pitch': { legLift: r('Contributes to lifting the front knee.'), '*': r('Contributes to hip flexion.') },
    'baseball-swing': { '*': r('Contributes to hip flexion in the stance; lengthens on the back side as the hips turn.') },
    'catcher-throw': { '*': r('Shortened in the squat; contributes to moving the stride leg.') },
  },
  'rotator-cuff': {
    'baseball-pitch': {
      cocking: r('Contributes to external rotation and to keeping the humeral head centred as the arm lays back.'),
      acceleration: r('Subscapularis contributes to internal rotation; the cuff helps keep the joint centred.'),
      deceleration: r('Posterior cuff is commonly discussed as helping slow the arm after release.'),
      '*': r('Contributes to centring the humeral head.'),
    },
    'catcher-throw': { stride: r('Contributes to external rotation as the arm gets up.'), followThrough: r('Posterior cuff contributes to decelerating the arm.'), '*': r('Contributes to shoulder joint centring.') },
    'baseball-swing': { followThrough: r('Contributes to shoulder control as the arms wrap around the body.'), '*': r('Contributes to shoulder joint centring.') },
  },
  'pectoralis-major': {
    'baseball-pitch': { cocking: r('Lengthened as the arm lays back and the chest opens.'), acceleration: r('Contributes to horizontal adduction and internal rotation as the arm drives forward.'), '*': r('Contributes to arm motion across the chest.') },
    'catcher-throw': { acceleration: r('Contributes to driving the arm forward.'), '*': r('Contributes to arm motion across the chest.') },
    'baseball-swing': { '*': r('Top-hand side contributes to pushing the bat through the zone.') },
  },
  'forearm-flexors': {
    'baseball-pitch': { cocking: r('Commonly discussed as dynamic support for the inner elbow as the arm lays back.'), acceleration: r('Contributes to wrist flexion and pronation into release (wrist not modeled).'), '*': r('Contributes to grip on the ball.') },
    'catcher-throw': { acceleration: r('Contributes to wrist flexion into release (wrist not modeled).'), '*': r('Contributes to grip on the ball.') },
    'baseball-swing': { contact: r('Contributes to grip firmness at contact.'), '*': r('Contributes to grip on the bat.') },
  },
  ucl: {
    'baseball-pitch': {
      cocking: r('Passive restraint against the elbow opening on the inside (valgus) as the arm lays back. Load is not calculated.'),
      acceleration: r('Passive restraint of the inner elbow early in acceleration. Load is not calculated.'),
      '*': r('Passive restraint of the inner elbow.'),
    },
    'catcher-throw': { acceleration: r('Passive restraint of the inner elbow. Load is not calculated.'), '*': r('Passive restraint of the inner elbow.') },
    'baseball-swing': { '*': r('Passive restraint of the inner elbow.') },
  },
  'elbow-joint': {
    'baseball-pitch': { cocking: r('Flexed near 90° in the cocked position.'), acceleration: r('Extends rapidly toward release.'), '*': r('Flexes and extends with the arm path.') },
    'catcher-throw': { '*': r('Short arm path: the elbow stays flexed until the arm drives forward.') },
    'baseball-swing': { '*': r('Back elbow flexes and stays close to the body, then extends through contact.') },
  },
  'hip-joint': {
    'baseball-swing': { '*': r('Back hip internally rotates in the load; front hip internally rotates as the pelvis opens over the front leg.') },
    'baseball-pitch': { '*': r('Lead hip internally rotates as the pelvis turns over the planted front leg.') },
    'catcher-throw': { '*': r('Deep flexion in the squat, then rotation as the catcher turns toward second base.') },
  },
  'knee-joint': {
    'baseball-swing': { '*': r('Front knee extends to brace through contact.') },
    'baseball-pitch': { '*': r('Lead knee flexes at foot contact and firms up toward release.') },
    'catcher-throw': { '*': r('Moves from deep flexion to a working position as the catcher rises.') },
  },
  'shoulder-joint': {
    'baseball-swing': { '*': r('Both shoulders move as the arms deliver the bat.') },
    'baseball-pitch': { '*': r('Moves through abduction, large external rotation in cocking, then internal rotation through release.') },
    'catcher-throw': { '*': r('Moves to a high, short-arm cocked position, then rotates through release.') },
  },
  'thoracolumbar-fascia': {
    'baseball-swing': { '*': r('Anatomical link between the lats, glutes and trunk wall that rotate together in the swing.') },
    'baseball-pitch': { '*': r('Anatomical link between the throwing-side lat and the opposite glute.') },
    'catcher-throw': { '*': r('Anatomical link between arm and hip musculature.') },
  },
  'line-spiral': {
    'baseball-swing': { '*': r('Interpretive lens: often used to discuss how hip and trunk rotation wrap around the body in the swing.') },
    'baseball-pitch': { '*': r('Interpretive lens: often used to discuss the stretch across the trunk at hip–shoulder separation.') },
    'catcher-throw': { '*': r('Interpretive lens: rotational wrap from the hip to the opposite shoulder.') },
  },
  'line-superficial-back': {
    'baseball-pitch': { '*': r('Interpretive lens: posterior continuity as the trunk flexes over the front leg in deceleration.') },
    'baseball-swing': { '*': r('Interpretive lens: posterior chain holding posture over the plate.') },
    'catcher-throw': { '*': r('Interpretive lens: posterior continuity in the squat.') },
  },
};
