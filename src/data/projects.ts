import type { Project, Requirement, RequirementMatch } from '../types';
import { projectImage } from './images';

const mat = (id: string, label: string, match: RequirementMatch, optional = false): Requirement => ({
  id,
  label,
  kind: 'material',
  optional,
  match,
});

const tool = (id: string, label: string, toolType: string, optional = false): Requirement => ({
  id,
  label,
  kind: 'tool',
  optional,
  match: { categories: ['tool'], itemTypes: [toolType] },
});

const oldJeans = mat('old-jeans', 'Old jeans', { categories: ['clothing'], itemTypes: ['jeans'] });
const scrapFabric = mat('scrap-fabric', 'Scrap fabric', { categories: ['material'], itemTypes: ['scraps'] });
const denimScraps = mat('denim-scraps', 'Denim scraps', { itemTypes: ['scraps'], materials: ['denim'] });
const anyDenim = mat('denim', 'Denim (jeans or scraps)', { materials: ['denim'] });
const canvas = mat('canvas', 'Canvas fabric', { materials: ['canvas'] });
const thread = mat('thread', 'Thread', { itemTypes: ['thread'] });
const snap = mat('snap', 'Snap button', { itemTypes: ['button-snap'] });
const zipper = mat('zipper', 'Zipper', { itemTypes: ['zipper'] });
const elastic = mat('elastic', 'Elastic', { itemTypes: ['elastic'] });
const webbing = mat('webbing', 'Webbing strap', { itemTypes: ['webbing'] });
const interfacing = mat('interfacing', 'Interfacing', { itemTypes: ['interfacing'] });
const tshirt = mat('t-shirt', 'Old T-shirt', { categories: ['clothing'], itemTypes: ['t-shirt'] });
const sweater = mat('sweater', 'Old wool sweater', { categories: ['clothing'], itemTypes: ['sweater'] });

const scissors = tool('scissors', 'Scissors', 'scissors');
const sewingMachine = tool('sewing-machine', 'Sewing machine', 'sewing-machine');
const pins = tool('pins', 'Pins', 'pins');
const needle = tool('needle', 'Hand needle', 'needle');
const iron = tool('iron', 'Iron', 'iron');
const measuringTape = tool('measuring-tape', 'Measuring tape', 'measuring-tape');
const seamRipper = tool('seam-ripper', 'Seam ripper', 'seam-ripper');

const wornGarment = mat('worn-garment', 'A garment to mend', { categories: ['clothing'] });
const buttonUp = mat('button-up', 'Old button-up shirt', { categories: ['clothing'], itemTypes: ['shirt'] });
const hoodie = mat('hoodie', 'Old hoodie', { categories: ['clothing'], itemTypes: ['hoodie'] });
const cord = mat('cord', 'Cord or ribbon', { itemTypes: ['cord'] });

export const PROJECTS: Project[] = [
  {
    id: 'patchwork-tote',
    title: 'Patchwork Tote',
    description:
      'A sturdy everyday tote built from the legs of old jeans and a patchwork of leftover fabric. The jean waistband becomes the strap.',
    difficulty: 2,
    minutes: 150,
    category: 'reconstruction',
    output: 'bag',
    usesScraps: true,
    art: 'grid',
    cover: projectImage(
      'patchwork-tote',
      'cover.png',
      'Patchwork denim tote with a jean pocket on the front and waistband straps',
    ),
    requirements: [oldJeans, scrapFabric, thread, scissors, sewingMachine, pins],
    steps: [
      {
        title: 'Cut denim panels',
        instructions:
          'Open the jean legs along the inside seam and lay them flat. Cut two 38 × 42 cm panels for the front and back, and keep the waistband whole for the straps.',
        uses: ['old-jeans', 'scissors'],
      },
      {
        title: 'Arrange pieces',
        instructions:
          'Cut your scrap fabric into rectangles of roughly 10 × 12 cm. Arrange them over the front panel until the layout feels balanced, leaving 1 cm of denim clear at every edge.',
        uses: ['scrap-fabric', 'scissors'],
      },
      {
        title: 'Pin pieces together',
        instructions:
          'Fold each scrap edge under by 5 mm and pin it to the denim panel. Pin across the seam line so you can sew straight over the pins slowly.',
        uses: ['scrap-fabric', 'pins'],
      },
      {
        title: 'Sew panels',
        instructions:
          'Topstitch each patch 3 mm from its folded edge. Then place front and back panels right sides together and sew around three sides with a 1 cm seam allowance.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Add straps',
        instructions:
          'Split the waistband into two equal strap lengths. Pin each end 8 cm in from the side seams on the inside of the bag, then box-stitch each end twice for strength.',
        uses: ['old-jeans', 'thread', 'sewing-machine', 'pins'],
      },
      {
        title: 'Finish edges',
        instructions:
          'Fold the top opening down 2 cm, then another 2 cm, and stitch around to hide the raw edge. Turn the tote right side out and press the seams flat.',
        uses: ['thread', 'sewing-machine'],
      },
    ],
  },
  {
    id: 'reworked-tshirt',
    title: 'Reworked T-Shirt',
    description:
      'Turn a tired, oversized tee into a cropped, boxy top with raw hems. No sewing required: a good first project.',
    difficulty: 1,
    minutes: 40,
    category: 'alteration',
    output: 'garment',
    usesScraps: false,
    art: 'stripes',
    cover: projectImage(
      'reworked-tshirt',
      'cover.png',
      'Cropped grey T-shirt with raw, rolled hems laid flat',
    ),
    requirements: [tshirt, scissors, tool('fabric-chalk', 'Fabric chalk', 'fabric-chalk', true)],
    steps: [
      {
        title: 'Try it on and mark',
        instructions:
          'Put the shirt on and mark where you want the new hem to sit, usually at or just above the natural waist. Add 2 cm below the mark for the edge to roll.',
        uses: ['t-shirt', 'fabric-chalk'],
      },
      {
        title: 'Lay flat and line up',
        instructions:
          'Lay the shirt flat, smoothing both layers. Draw a straight line across at your mark, using the side seams to keep it level.',
        uses: ['t-shirt', 'fabric-chalk'],
      },
      {
        title: 'Cut the hem',
        instructions:
          'Cut along the line through both layers in long, steady cuts. Keep the offcut: it becomes scrap fabric for another project.',
        uses: ['scissors'],
      },
      {
        title: 'Shape the sleeves',
        instructions:
          'Cut off the sleeve hems just above the stitching for a raw edge, or roll them twice for a structured, boxy shoulder.',
        uses: ['scissors'],
      },
      {
        title: 'Stretch the edges',
        instructions:
          'Gently pull the new cut edges so the jersey curls into a clean, soft roll. Wash once to settle the finish.',
        uses: ['t-shirt'],
      },
    ],
  },
  {
    id: 'patchwork-shorts',
    title: 'Patchwork Shorts',
    description:
      'Cut old jeans into shorts and reinforce worn areas with visible patchwork. The patches are meant to be seen.',
    difficulty: 3,
    minutes: 180,
    category: 'reconstruction',
    output: 'garment',
    usesScraps: true,
    art: 'hatch',
    cover: projectImage(
      'patchwork-shorts',
      'cover.png',
      'Denim shorts with contrasting patches sewn on the thighs',
    ),
    requirements: [oldJeans, scrapFabric, thread, scissors, sewingMachine, pins, tool('seam-ripper', 'Seam ripper', 'seam-ripper', true)],
    steps: [
      {
        title: 'Mark the length',
        instructions:
          'Try the jeans on and mark your preferred short length. Add 3 cm for a rolled cuff or 1 cm for a frayed edge.',
        uses: ['old-jeans'],
      },
      {
        title: 'Cut the legs',
        instructions:
          'Fold the jeans in half so both legs line up and cut them together for an even length.',
        uses: ['old-jeans', 'scissors'],
      },
      {
        title: 'Plan the patches',
        instructions:
          'Find worn or thin areas. Cut scrap patches 2 cm larger than each area on all sides and arrange them, inside or outside depending on the look you want.',
        uses: ['scrap-fabric', 'scissors'],
      },
      {
        title: 'Pin patches',
        instructions:
          'Pin each patch in place. If a pocket or seam gets in the way, open a few stitches with a seam ripper and close them again afterwards.',
        uses: ['pins', 'seam-ripper'],
      },
      {
        title: 'Stitch patches',
        instructions:
          'Sew around each patch 5 mm from the edge, then add a few rows of straight stitching across the worn area to hold everything flat.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Finish the hem',
        instructions:
          'Either stitch 1 cm above the raw edge and wash to fray, or fold the cuff up twice and tack it at the side seams.',
        uses: ['thread', 'sewing-machine'],
      },
    ],
  },
  {
    id: 'denim-patches',
    title: 'Denim Patches',
    description:
      'Small hand-stitched patches cut from denim offcuts, ready to mend knees, elbows, and bags. A good use for the smallest scraps.',
    difficulty: 1,
    minutes: 50,
    category: 'repair',
    output: 'accessory',
    usesScraps: true,
    art: 'dots',
    cover: projectImage(
      'denim-patches',
      'cover.png',
      'Small denim patches with hand-sewn running-stitch borders',
    ),
    requirements: [denimScraps, thread, scissors, needle],
    steps: [
      {
        title: 'Choose your scraps',
        instructions:
          'Sort denim scraps by shade. Patches look strongest when they contrast with what they will cover.',
        uses: ['denim-scraps'],
      },
      {
        title: 'Cut shapes',
        instructions:
          'Cut squares, circles, or rectangles between 5 and 10 cm. Round the corners slightly so they are less likely to catch and lift.',
        uses: ['denim-scraps', 'scissors'],
      },
      {
        title: 'Add a running stitch border',
        instructions:
          'Thread a needle with doubled thread and sew a running stitch 5 mm in from the edge of each patch. This stops fraying and adds a hand-made detail.',
        uses: ['thread', 'needle'],
      },
      {
        title: 'Stitch a pattern',
        instructions:
          'Add parallel lines or a cross pattern across the patch with the same running stitch, in the style of sashiko mending.',
        uses: ['thread', 'needle'],
      },
    ],
  },
  {
    id: 'denim-wallet',
    title: 'Denim Wallet',
    description:
      'A slim bifold wallet with card slots, cut from the sturdy seams of old denim and closed with a single snap.',
    difficulty: 3,
    minutes: 150,
    category: 'accessory',
    output: 'accessory',
    usesScraps: true,
    art: 'weave',
    cover: projectImage(
      'denim-wallet',
      'cover.png',
      'Slim denim bifold wallet, slightly open to show the card slots',
    ),
    requirements: [anyDenim, thread, snap, scissors, sewingMachine, tool('pins', 'Pins', 'pins', true)],
    steps: [
      {
        title: 'Cut the body',
        instructions:
          'Cut one 22 × 10 cm rectangle for the outer body and one of the same size for the lining. Use the thickest part of the denim.',
        uses: ['denim', 'scissors'],
      },
      {
        title: 'Cut card slots',
        instructions:
          'Cut two 10 × 14 cm pieces for card pockets. Fold each in half lengthwise so the folded edge becomes the pocket opening.',
        uses: ['denim', 'scissors'],
      },
      {
        title: 'Place the pockets',
        instructions:
          'Layer the pockets on the lining, stepped 1.5 cm apart, and hold them with pins or clips.',
        uses: ['pins'],
      },
      {
        title: 'Sew it together',
        instructions:
          'Place outer and lining wrong sides together and topstitch all the way around 4 mm from the edge. Sew slowly through the thick layers.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Add the snap',
        instructions:
          'Fold the wallet closed and mark where the flap meets the front. Attach the snap halves following the packet instructions.',
        uses: ['snap'],
      },
    ],
  },
  {
    id: 'canvas-zip-pouch',
    title: 'Canvas Zip Pouch',
    description:
      'A flat zip pouch for pens, cables, or a sewing kit. It needs only a small canvas offcut and one zipper.',
    difficulty: 2,
    minutes: 105,
    category: 'accessory',
    output: 'bag',
    usesScraps: true,
    art: 'plain',
    cover: projectImage(
      'canvas-zip-pouch',
      'cover.png',
      'Flat natural-canvas zip pouch closed on a grey backdrop',
    ),
    requirements: [canvas, zipper, thread, scissors, sewingMachine, pins],
    steps: [
      {
        title: 'Cut the panels',
        instructions: 'Cut two canvas panels 2 cm wider than your zipper and around 15 cm tall.',
        uses: ['canvas', 'scissors'],
      },
      {
        title: 'Pin the zipper',
        instructions:
          'Place the zipper face down along the top edge of one panel, right sides together, and pin along the length.',
        uses: ['zipper', 'pins'],
      },
      {
        title: 'Sew the zipper',
        instructions:
          'Sew close to the zipper teeth. Repeat with the second panel on the other side of the zipper, then topstitch both sides.',
        uses: ['zipper', 'thread', 'sewing-machine'],
      },
      {
        title: 'Close the pouch',
        instructions:
          'Open the zipper halfway. Fold right sides together and sew around the remaining three sides with a 1 cm seam.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Turn and press',
        instructions: 'Clip the corners, turn the pouch right side out through the open zipper, and push the corners out.',
        uses: ['scissors'],
      },
    ],
  },
  {
    id: 'sweater-mittens',
    title: 'Sweater Mittens',
    description:
      'Warm mittens cut from a shrunken or worn wool sweater. The original ribbed cuff becomes the wrist.',
    difficulty: 2,
    minutes: 105,
    category: 'reconstruction',
    output: 'accessory',
    usesScraps: false,
    art: 'weave',
    cover: projectImage(
      'sweater-mittens',
      'cover.png',
      'A pair of wool mittens with ribbed sweater cuffs',
    ),
    requirements: [sweater, thread, scissors, sewingMachine, pins],
    steps: [
      {
        title: 'Trace your hand',
        instructions:
          'Trace around your hand on paper with fingers together and thumb out. Add 1.5 cm all around for seams and ease.',
        uses: [],
      },
      {
        title: 'Cut the pieces',
        instructions:
          'Place the bottom of the pattern on the sweater\u2019s ribbed hem and cut four mitten shapes, two per hand.',
        uses: ['sweater', 'scissors'],
      },
      {
        title: 'Pin pairs together',
        instructions: 'Pin each pair right sides together, matching the cuff edges carefully.',
        uses: ['pins'],
      },
      {
        title: 'Sew around the hand',
        instructions:
          'Use a stretch or narrow zigzag stitch and sew around each mitten, leaving the cuff open. Stitch twice around the thumb.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Trim and turn',
        instructions: 'Trim the seam allowance to 5 mm, clip into the thumb curve, and turn right side out.',
        uses: ['scissors'],
      },
    ],
  },
  {
    id: 'scrap-scrunchie',
    title: 'Scrap Scrunchie',
    description: 'A soft, gathered scrunchie from one long strip of leftover fabric, sewn by hand.',
    difficulty: 1,
    minutes: 50,
    category: 'accessory',
    output: 'accessory',
    usesScraps: true,
    art: 'dots',
    cover: projectImage(
      'scrap-scrunchie',
      'cover.png',
      'A gathered fabric scrunchie resting on linen',
    ),
    requirements: [scrapFabric, elastic, thread, scissors, needle],
    steps: [
      {
        title: 'Cut a strip',
        instructions: 'Cut a strip of fabric 50 × 10 cm. Piece two shorter scraps together if needed.',
        uses: ['scrap-fabric', 'scissors'],
      },
      {
        title: 'Sew a tube',
        instructions:
          'Fold the strip lengthwise, right sides together, and hand-stitch along the long edge. Turn it right side out.',
        uses: ['thread', 'needle'],
      },
      {
        title: 'Thread the elastic',
        instructions:
          'Cut 20 cm of elastic. Attach a safety pin to one end and feed it through the tube, gathering the fabric as you go.',
        uses: ['elastic'],
      },
      {
        title: 'Close it up',
        instructions:
          'Overlap the elastic ends by 2 cm and stitch firmly. Tuck one fabric end into the other and slip-stitch closed.',
        uses: ['elastic', 'thread', 'needle'],
      },
    ],
  },
  {
    id: 'shoulder-bag',
    title: 'Shoulder Bag',
    description:
      'A structured zip-top shoulder bag with a canvas body, interfaced for shape, and a long webbing strap.',
    difficulty: 4,
    minutes: 270,
    category: 'accessory',
    output: 'bag',
    usesScraps: false,
    art: 'hatch',
    cover: projectImage(
      'shoulder-bag',
      'cover.png',
      'Structured canvas shoulder bag with a zip top and webbing strap',
    ),
    requirements: [canvas, webbing, zipper, thread, interfacing, scissors, sewingMachine, pins, iron],
    steps: [
      {
        title: 'Cut and interface',
        instructions:
          'Cut two 30 × 24 cm body panels and a 70 × 8 cm gusset. Iron interfacing onto the back of every piece.',
        uses: ['canvas', 'interfacing', 'scissors', 'iron'],
      },
      {
        title: 'Install the zipper',
        instructions:
          'Split the top of the gusset and sew the zipper between the two halves, then topstitch on both sides.',
        uses: ['zipper', 'thread', 'sewing-machine', 'pins'],
      },
      {
        title: 'Attach the strap tabs',
        instructions: 'Cut two 8 cm webbing tabs, fold them into loops, and baste them to the gusset ends.',
        uses: ['webbing', 'sewing-machine'],
      },
      {
        title: 'Sew the body',
        instructions:
          'Pin the gusset around one body panel, clipping the curves, and sew. Repeat with the second panel.',
        uses: ['pins', 'thread', 'sewing-machine'],
      },
      {
        title: 'Finish the strap',
        instructions:
          'Thread the remaining webbing through both loops, adjust to shoulder length, and box-stitch the ends.',
        uses: ['webbing', 'thread', 'sewing-machine'],
      },
      {
        title: 'Press and shape',
        instructions: 'Turn the bag right side out through the zipper and press the seams to set the shape.',
        uses: ['iron'],
      },
    ],
  },
  {
    id: 'denim-bucket-hat',
    title: 'Denim Bucket Hat',
    description:
      'A reversible bucket hat made from denim, sized with a measuring tape and stiffened with interfacing in the brim.',
    difficulty: 4,
    minutes: 210,
    category: 'accessory',
    output: 'accessory',
    usesScraps: false,
    art: 'stripes',
    cover: projectImage(
      'denim-bucket-hat',
      'cover.png',
      'Medium-wash denim bucket hat with topstitched brim rings',
    ),
    requirements: [anyDenim, interfacing, thread, scissors, sewingMachine, pins, iron, measuringTape],
    steps: [
      {
        title: 'Measure your head',
        instructions:
          'Measure around your head just above the ears and add 2 cm. This sets the crown and brim circumference.',
        uses: ['measuring-tape'],
      },
      {
        title: 'Cut the pieces',
        instructions:
          'Cut a crown circle, a side band, and a brim ring from denim, plus a matching brim ring from interfacing.',
        uses: ['denim', 'interfacing', 'scissors'],
      },
      {
        title: 'Interface the brim',
        instructions: 'Iron the interfacing onto the back of the denim brim.',
        uses: ['interfacing', 'iron'],
      },
      {
        title: 'Assemble the crown',
        instructions:
          'Sew the side band into a loop, then pin and sew the crown circle into its top edge, easing around the curve.',
        uses: ['pins', 'thread', 'sewing-machine'],
      },
      {
        title: 'Attach the brim',
        instructions: 'Pin the brim to the bottom of the side band and sew. Topstitch rings around the brim for structure.',
        uses: ['pins', 'thread', 'sewing-machine'],
      },
    ],
  },
  {
    id: 'cutoff-shorts',
    title: 'Cut-Off Shorts',
    description:
      'The fastest way to give worn-out jeans a second life. Cut, cuff or fray, and wear the same afternoon.',
    difficulty: 1,
    minutes: 40,
    category: 'alteration',
    output: 'garment',
    usesScraps: false,
    art: 'hatch',
    cover: projectImage(
      'cutoff-shorts',
      'cover.jpg',
      'Light-wash denim cut-off shorts with long frayed hems, worn with white socks and blue sneakers',
    ),
    requirements: [
      oldJeans,
      scissors,
      tool('measuring-tape', 'Measuring tape', 'measuring-tape', true),
      tool('fabric-chalk', 'Fabric chalk', 'fabric-chalk', true),
    ],
    steps: [
      {
        title: 'Mark your length',
        instructions:
          'Put the jeans on and mark your preferred length on the outer leg. Add 2 cm for a frayed edge or 5 cm if you want to roll a cuff.',
        uses: ['old-jeans', 'fabric-chalk'],
      },
      {
        title: 'Measure both legs',
        instructions:
          'Lay the jeans flat and measure down the inseam of the marked leg. Transfer the same measurement to the other leg so both sides match.',
        uses: ['measuring-tape', 'fabric-chalk'],
      },
      {
        title: 'Cut one leg first',
        instructions:
          'Cut straight across the first leg, angling slightly longer toward the back. Fold the jeans in half and use it as a guide for the second leg.',
        uses: ['old-jeans', 'scissors'],
      },
      {
        title: 'Finish the hem',
        instructions:
          'For fray, wash and dry once and trim loose threads. For a cuff, fold up twice by 2.5 cm and press it with your hand.',
        uses: ['old-jeans'],
      },
    ],
  },
  {
    id: 'tshirt-tote',
    title: 'No-Sew T-Shirt Tote',
    description:
      'A stretchy market bag made from a single T-shirt. The sleeves become the handles and the hem is knotted closed. No needle needed.',
    difficulty: 1,
    minutes: 35,
    category: 'reconstruction',
    output: 'bag',
    usesScraps: false,
    art: 'stripes',
    cover: projectImage(
      'tshirt-tote',
      'cover.png',
      'Market tote made from a T-shirt, with knotted strips closing the bottom',
    ),
    requirements: [tshirt, scissors, tool('fabric-chalk', 'Fabric chalk', 'fabric-chalk', true)],
    steps: [
      {
        title: 'Cut off the sleeves',
        instructions:
          'Lay the shirt flat and cut both sleeves off just inside the seam. The shoulder straps that remain become your handles.',
        uses: ['t-shirt', 'scissors'],
      },
      {
        title: 'Open the neckline',
        instructions:
          'Mark a U shape about 8 cm below the collar, through both layers, and cut it out to form the bag opening.',
        uses: ['t-shirt', 'scissors', 'fabric-chalk'],
      },
      {
        title: 'Cut the fringe',
        instructions:
          'Cut 8 cm strips up from the hem, about 2 cm wide, through both layers.',
        uses: ['scissors'],
      },
      {
        title: 'Knot it closed',
        instructions:
          'Tie each front strip to the back strip beneath it with a double knot. Then tie neighbouring pairs together so there are no gaps at the bottom.',
        uses: ['t-shirt'],
      },
    ],
  },
  {
    id: 'jean-leg-tote',
    title: 'Jean Leg Tote',
    description:
      'A simple, sturdy tote built from two jean legs, with the back pockets kept on the outside. A good first bag for a sewing machine.',
    difficulty: 2,
    minutes: 105,
    category: 'reconstruction',
    output: 'bag',
    usesScraps: false,
    art: 'weave',
    cover: projectImage(
      'jean-leg-tote',
      'cover.png',
      'Denim tote sewn from jean legs, with the back pockets on the outside',
    ),
    requirements: [oldJeans, thread, scissors, sewingMachine, pins],
    steps: [
      {
        title: 'Cut the legs off',
        instructions:
          'Cut both legs off just below the crotch, then split each leg open along the inseam so you have two flat panels.',
        uses: ['old-jeans', 'scissors'],
      },
      {
        title: 'Square the panels',
        instructions:
          'Trim both panels to the same rectangle, about 35 × 40 cm. Cut two 6 × 60 cm strips from the leftover denim for handles.',
        uses: ['old-jeans', 'scissors'],
      },
      {
        title: 'Sew the body',
        instructions:
          'Pin the panels right sides together and sew around the sides and bottom with a 1 cm seam. Box the corners 4 cm in for a flat base.',
        uses: ['pins', 'thread', 'sewing-machine'],
      },
      {
        title: 'Make the handles',
        instructions:
          'Fold each strip into thirds lengthwise and topstitch both edges.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Hem and attach',
        instructions:
          'Fold the top edge under twice and stitch it. Pin the handles inside, 8 cm from each side seam, and box-stitch them in place.',
        uses: ['pins', 'thread', 'sewing-machine'],
      },
    ],
  },
  {
    id: 'boxy-crop-shirt',
    title: 'Boxy Cropped Shirt',
    description:
      'Turn an oversized button-up into a boxy, cropped shirt with a clean new hem. The original buttons and collar stay.',
    difficulty: 3,
    minutes: 90,
    category: 'alteration',
    output: 'garment',
    usesScraps: false,
    art: 'stripes',
    cover: projectImage(
      'boxy-crop-shirt',
      'cover.png',
      'Cropped button-up shirt with the collar kept and sleeves rolled',
    ),
    requirements: [buttonUp, thread, scissors, sewingMachine, pins, measuringTape, tool('iron', 'Iron', 'iron', true)],
    steps: [
      {
        title: 'Mark the crop line',
        instructions:
          'Button the shirt on and mark where you want the hem, usually 5 cm above the waist. Add 3 cm below the mark for the hem allowance.',
        uses: ['button-up', 'measuring-tape'],
      },
      {
        title: 'Cut straight across',
        instructions:
          'Lay the shirt flat, fronts lined up, and cut straight across at the allowance line. Keep the offcut for pocket patches or scrap projects.',
        uses: ['button-up', 'scissors', 'measuring-tape'],
      },
      {
        title: 'Press the hem',
        instructions:
          'Fold the raw edge up 1 cm, then 2 cm, and pin it all the way around. Press it with an iron if you have one for a sharper edge.',
        uses: ['pins', 'iron'],
      },
      {
        title: 'Stitch the hem',
        instructions:
          'Sew close to the inner fold. At the front plackets, fold the ends in neatly and backstitch so the edge doesn\u2019t unravel.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Shorten the sleeves',
        instructions:
          'Roll the sleeves twice to just above the elbow and tack them at the underarm seam with a few stitches so they stay put.',
        uses: ['button-up', 'thread'],
      },
    ],
  },
  {
    id: 'tapered-jeans',
    title: 'Tapered Jeans',
    description:
      'Take in wide or straight-leg jeans for a tapered fit. It\u2019s a real alteration and a good step up in machine skills.',
    difficulty: 3,
    minutes: 150,
    category: 'alteration',
    output: 'garment',
    usesScraps: false,
    art: 'hatch',
    cover: projectImage(
      'tapered-jeans',
      'cover.png',
      'Dark jeans that narrow from the knee to the hem',
    ),
    requirements: [oldJeans, thread, sewingMachine, pins, seamRipper, tool('fabric-chalk', 'Fabric chalk', 'fabric-chalk', true)],
    steps: [
      {
        title: 'Pin the new fit',
        instructions:
          'Turn the jeans inside out and put them on. Pin along the inseam from the knee down until the leg is as narrow as you want it.',
        uses: ['old-jeans', 'pins'],
      },
      {
        title: 'Mark the seam line',
        instructions:
          'Take the jeans off and chalk a smooth line along the pins, blending gradually into the original seam at the knee.',
        uses: ['fabric-chalk'],
      },
      {
        title: 'Open the hem',
        instructions: 'Unpick the hem for 5 cm on either side of the inseam so you can sew through it cleanly.',
        uses: ['seam-ripper'],
      },
      {
        title: 'Sew the new seam',
        instructions:
          'Sew along the chalk line with a slightly longer stitch. Try them on before trimming anything.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Trim and re-hem',
        instructions:
          'Trim the seam allowance to 1.5 cm, zigzag the raw edge, then fold the hem back up and stitch it closed.',
        uses: ['thread', 'sewing-machine'],
      },
    ],
  },
  {
    id: 'knee-patch-repair',
    title: 'Knee Patch Repair',
    description:
      'Mend a torn knee or elbow from the inside with a fabric patch and a few rows of hand stitching. Keep wearing what you already love.',
    difficulty: 1,
    minutes: 50,
    category: 'repair',
    output: 'garment',
    usesScraps: true,
    art: 'plain',
    cover: projectImage(
      'knee-patch-repair',
      'cover.png',
      'A worn jean knee mended with a fabric patch and rows of running stitch',
    ),
    requirements: [wornGarment, scrapFabric, thread, needle, scissors, tool('pins', 'Pins', 'pins', true)],
    steps: [
      {
        title: 'Trim the hole',
        instructions: 'Snip away loose threads around the tear so the edges are clean, without making the hole bigger.',
        uses: ['worn-garment', 'scissors'],
      },
      {
        title: 'Cut the patch',
        instructions:
          'Cut a scrap 3 cm larger than the hole on every side. Round the corners so they don\u2019t lift with wear.',
        uses: ['scrap-fabric', 'scissors'],
      },
      {
        title: 'Place it inside',
        instructions:
          'Turn the garment inside out and position the patch behind the hole, right side facing out through the tear. Pin or hold it flat.',
        uses: ['worn-garment', 'scrap-fabric', 'pins'],
      },
      {
        title: 'Stitch around the edge',
        instructions:
          'From the outside, sew a small running stitch around the hole 5 mm from its edge, through both layers.',
        uses: ['thread', 'needle'],
      },
      {
        title: 'Reinforce',
        instructions:
          'Add parallel rows of running stitch across the whole patch area, 5 mm apart, so the worn fabric is held flat against the patch.',
        uses: ['thread', 'needle'],
      },
    ],
  },
  {
    id: 'sashiko-mending',
    title: 'Sashiko Visible Mending',
    description:
      'Reinforce thin, worn areas with decorative sashiko-style stitching. The mend becomes the detail instead of something to hide.',
    difficulty: 2,
    minutes: 105,
    category: 'repair',
    output: 'garment',
    usesScraps: true,
    art: 'grid',
    cover: projectImage(
      'sashiko-mending',
      'cover.png',
      'Worn indigo cloth reinforced with a grid of white sashiko stitches',
    ),
    requirements: [
      wornGarment,
      thread,
      needle,
      mat('scrap-fabric', 'Backing scrap', { categories: ['material'], itemTypes: ['scraps'] }, true),
      tool('fabric-chalk', 'Fabric chalk', 'fabric-chalk', true),
    ],
    steps: [
      {
        title: 'Find the worn area',
        instructions:
          'Hold the garment up to the light to find thin spots. Mark a square or rectangle around the area, 2 cm larger on every side.',
        uses: ['worn-garment', 'fabric-chalk'],
      },
      {
        title: 'Add a backing',
        instructions:
          'If the fabric has a hole, tack a scrap behind it with a few loose stitches. For thin spots only, you can skip this.',
        uses: ['scrap-fabric', 'needle', 'thread'],
      },
      {
        title: 'Draw a grid',
        instructions: 'Chalk parallel lines 5 mm apart across the marked area. Add crossing lines for a grid pattern.',
        uses: ['fabric-chalk'],
      },
      {
        title: 'Stitch the lines',
        instructions:
          'Sew even running stitches along each line, about 3–4 stitches per centimetre. Leave a small loop at each turn so the fabric can still stretch.',
        uses: ['thread', 'needle'],
      },
      {
        title: 'Finish and press',
        instructions: 'Knot the thread on the inside, brush off the chalk, and flatten the mend with your hand or an iron.',
        uses: ['thread'],
      },
    ],
  },
  {
    id: 'cropped-zip-hoodie',
    title: 'Cropped Zip Hoodie',
    description:
      'Reconstruct a pullover hoodie into a cropped zip-front jacket: open the front, add a zipper, and rebuild the hem band.',
    difficulty: 4,
    minutes: 210,
    category: 'reconstruction',
    output: 'garment',
    usesScraps: false,
    art: 'weave',
    cover: projectImage(
      'cropped-zip-hoodie',
      'cover.png',
      'Cropped grey hoodie with a centre-front zipper and ribbed hem',
    ),
    requirements: [hoodie, zipper, thread, scissors, sewingMachine, pins, seamRipper, measuringTape],
    steps: [
      {
        title: 'Remove the hem band',
        instructions:
          'Unpick the ribbed band from the bottom of the hoodie and set it aside. You\u2019ll reattach it at the new length.',
        uses: ['hoodie', 'seam-ripper'],
      },
      {
        title: 'Crop the body',
        instructions:
          'Measure down from the shoulder to your crop length plus 1 cm and cut straight across, front and back.',
        uses: ['hoodie', 'measuring-tape', 'scissors'],
      },
      {
        title: 'Open the front',
        instructions:
          'Fold the hoodie in half to find the centre front. Mark it and cut straight up from the hem to the neckline, through the pocket.',
        uses: ['hoodie', 'measuring-tape', 'scissors'],
      },
      {
        title: 'Reattach the band',
        instructions:
          'Cut the band open at its seam, pin it to the new hem stretching it slightly, and sew with a stretch stitch.',
        uses: ['pins', 'thread', 'sewing-machine'],
      },
      {
        title: 'Install the zipper',
        instructions:
          'Pin the zipper face down along each front edge, right sides together, then sew with a zipper foot. Fold the edges back and topstitch.',
        uses: ['zipper', 'pins', 'thread', 'sewing-machine'],
      },
    ],
  },
  {
    id: 'drawstring-pouch',
    title: 'Scrap Drawstring Pouch',
    description:
      'A lined drawstring pouch for small things, sewn from two scraps and a length of cord. Good for using up odd-shaped offcuts.',
    difficulty: 2,
    minutes: 75,
    category: 'accessory',
    output: 'bag',
    usesScraps: true,
    art: 'dots',
    cover: projectImage(
      'drawstring-pouch',
      'cover.png',
      'Small drawstring pouch sewn from two contrasting scraps',
    ),
    requirements: [scrapFabric, cord, thread, scissors, sewingMachine, pins],
    steps: [
      {
        title: 'Cut two rectangles',
        instructions: 'Cut two scraps to 20 × 25 cm. They don\u2019t need to match; contrasting fabrics look good.',
        uses: ['scrap-fabric', 'scissors'],
      },
      {
        title: 'Sew the sides',
        instructions:
          'Pin the pieces right sides together and sew down both sides and across the bottom. Stop 5 cm below the top on each side.',
        uses: ['pins', 'thread', 'sewing-machine'],
      },
      {
        title: 'Make the channel',
        instructions:
          'Press the open seam allowances flat. Fold the top edge down 1 cm, then 2.5 cm, and stitch close to the fold to form a channel.',
        uses: ['thread', 'sewing-machine'],
      },
      {
        title: 'Thread the cord',
        instructions:
          'Cut cord twice the width of the pouch plus 20 cm. Feed it through both channels with a safety pin and knot the ends together.',
        uses: ['cord', 'scissors'],
      },
    ],
  },
];

export function getProject(id: string | undefined): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
