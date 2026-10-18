/*
 * Computational Neuroscience Sc.B. requirements, transcribed from the
 * University Bulletin. Source of truth: the Bulletin, not this file.
 *
 * Recheck every fall against SITE.concentration.bulletin and update
 * `CHECKED` (README: "Course map"). Add a `note` to any course for
 * student tips such as "usually fall" or "good first elective".
 */

export const BULLETIN_YEAR = '2026–27';
export const CHECKED = '2026-10-17';
export const TOTAL_COURSES = 18;

export interface Course {
  code: string;
  title: string;
  note?: string;
}

export interface Requirement {
  id: string;
  title: string;
  /** How many courses from `options` count toward this requirement. */
  take: number;
  options: Course[];
  /** Shown under the course list, e.g. substitutions. */
  footnote?: string;
}

export interface Stage {
  id: string;
  title: string;
  requirements: Requirement[];
}

/** Bulletin course lookup (shows the official description). */
export const courseUrl = (code: string) => `https://bulletin.brown.edu/search/?P=${encodeURIComponent(code)}`;

export const STAGES: Stage[] = [
  {
    id: 'background',
    title: 'Background',
    requirements: [
      {
        id: 'calculus',
        title: 'Calculus',
        take: 1,
        options: [{ code: 'MATH 0100', title: 'Single Variable Calculus, Part II' }],
        footnote: 'APMA 0260 can replace MATH 0100 and MATH 0520/0540.',
      },
      {
        id: 'differential-equations',
        title: 'Differential equations',
        take: 1,
        options: [{ code: 'APMA 0350', title: 'Applied Ordinary Differential Equations' }],
      },
      {
        id: 'linear-algebra',
        title: 'Linear algebra',
        take: 1,
        options: [
          { code: 'MATH 0520', title: 'Linear Algebra' },
          { code: 'MATH 0540', title: 'Linear Algebra With Theory' },
        ],
        footnote: 'APMA 0260 can replace MATH 0100 and MATH 0520/0540.',
      },
      {
        id: 'statistics',
        title: 'Statistics',
        take: 1,
        options: [
          { code: 'APMA 1650', title: 'Introduction to Probability and Statistics with Calculus' },
          { code: 'APMA 1655', title: 'Introduction to Probability and Statistics with Theory' },
          { code: 'CPSY 0900', title: 'Statistical Methods' },
          { code: 'BIOL 0495', title: 'Statistical Analysis of Biological Data' },
          { code: 'CSCI 1450', title: 'Advanced Introduction to Probability for Computing and Data Science' },
        ],
      },
    ],
  },
  {
    id: 'core',
    title: 'Core',
    requirements: [
      {
        id: 'intro-neuro',
        title: 'Intro to neuroscience',
        take: 1,
        options: [{ code: 'NEUR 0010', title: 'The Brain: An Introduction to Neuroscience' }],
      },
      {
        id: 'neurobiology',
        title: 'Neurobiology',
        take: 1,
        options: [
          { code: 'NEUR 1020', title: 'Principles of Neurobiology' },
          { code: 'NEUR 1030', title: 'Neural Systems' },
        ],
      },
      {
        id: 'intro-cs',
        title: 'Intro computer science',
        take: 1,
        options: [
          { code: 'CSCI 0111', title: 'Computing Foundations: Data' },
          { code: 'CSCI 0112', title: 'Computing Foundations: Program Organization' },
          { code: 'CSCI 0150', title: 'Introduction to Object-Oriented Programming and Computer Science' },
          { code: 'CSCI 0170', title: 'Computer Science: An Integrated Introduction' },
          { code: 'CSCI 0190', title: 'Accelerated Introduction to Computer Science' },
        ],
      },
      {
        id: 'data-structures',
        title: 'Data structures',
        take: 1,
        options: [
          { code: 'CSCI 0200', title: 'Program Design with Data Structures and Algorithms' },
          { code: 'CSCI 0190', title: 'Accelerated Introduction to Computer Science' },
        ],
      },
      {
        id: 'intro-comp-neuro',
        title: 'Intro to computational neuroscience',
        take: 1,
        options: [{ code: 'NEUR 0680', title: 'Introduction to Computational Neuroscience' }],
      },
    ],
  },
  {
    id: 'electives',
    title: 'Electives',
    requirements: [
      {
        id: 'comp-neuro-electives',
        title: 'Computational neuroscience',
        take: 2,
        options: [
          { code: 'CPSY 1492', title: 'Computational Cognitive Neuroscience' },
          { code: 'NEUR 1440', title: 'Mechanisms and Meaning of Neural Dynamics' },
          { code: 'NEUR 1660', title: 'Neural Computation in Learning and Decision-Making' },
          { code: 'CPSY 1291', title: 'Computational Methods for Mind, Brain and Behavior' },
          { code: 'CSCI 1810', title: 'Computational Molecular Biology' },
          { code: 'NEUR 1940B', title: 'Deep Learning in Neuroethology' },
          { code: 'NEUR 1630', title: 'Big Data Neuroscience Ideas Lab' },
          { code: 'CPSY 1950', title: 'Deep Learning in Brains, Minds and Machines' },
          { code: 'CPSY 1850', title: 'Language Processing in Humans and Machines' },
          { code: 'NEUR 2110', title: 'Statistical Neuroscience' },
        ],
      },
      {
        id: 'ai',
        title: 'Artificial intelligence',
        take: 1,
        options: [
          { code: 'CSCI 0410', title: 'Foundations of AI and Machine Learning' },
          { code: 'CSCI 1410', title: 'Artificial Intelligence' },
          { code: 'CSCI 1411', title: 'Foundations of AI and Machine Learning' },
          { code: 'CSCI 1420', title: 'Machine Learning' },
          { code: 'CSCI 1430', title: 'Computer Vision' },
          { code: 'CSCI 1460', title: 'Computational Linguistics' },
          { code: 'CSCI 1470', title: 'Deep Learning' },
          { code: 'DATA 2060', title: 'Machine Learning: from Theory to Algorithms' },
          { code: 'HIST 1956S', title: 'History of Artificial Intelligence' },
        ],
      },
      {
        id: 'upper-neuro',
        title: 'Upper-level neuroscience',
        take: 2,
        options: [
          { code: 'CPSY 1400', title: 'The Neural Bases of Cognition' },
          { code: 'ENGL 1900Z', title: 'Neuroaesthetics and Reading' },
          { code: 'ENGN 1220', title: 'Neuroengineering' },
          { code: 'NEUR 1540', title: 'Neurobiology of Learning and Memory' },
          { code: 'NEUR 1650', title: 'Structure of the Nervous System' },
          { code: 'NEUR 1740', title: 'The Diseased Brain: Mechanisms of Neurological and Psychiatric Disorders' },
        ],
        footnote: 'Common choices. Any 1000-level course that builds your understanding of neuroscience can count; check with your advisor.',
      },
      {
        id: 'ethics',
        title: 'Ethics',
        take: 1,
        options: [
          { code: 'CSCI 1805', title: 'Computers, Freedom and Privacy' },
          { code: 'CSCI 1951I', title: 'CS for Social Change' },
          { code: 'DATA 0080', title: 'Data, Ethics and Society' },
          { code: 'ECON 1000', title: 'Using Big Data to Solve Economic and Social Problems' },
          { code: 'ENGN 1800', title: 'Social Impact of Emerging Technologies: The Role of Scientists and Engineers' },
          { code: 'PHIL 0401', title: 'Ethics of Digital Technology' },
          { code: 'PHIL 0403', title: 'Ethics and Politics of Data' },
          { code: 'APMA 1910', title: 'Race and Gender in the Scientific Community' },
          { code: 'STS 1700T', title: 'Race, Gender, and Technology in Everyday Life' },
        ],
      },
      {
        id: 'additional',
        title: 'Additional electives',
        take: 2,
        options: [
          { code: 'APMA 0160', title: 'Introduction to Scientific Computing' },
          { code: 'APMA 0200', title: 'Introduction to Modeling' },
          { code: 'APMA 0360', title: 'Applied Partial Differential Equations I' },
          { code: 'APMA 1070', title: 'Quantitative Models of Biological Systems' },
          { code: 'APMA 1170', title: 'Introduction to Computational Linear Algebra' },
          { code: 'APMA 1360', title: 'Applied Dynamical Systems' },
          { code: 'APMA 1660', title: 'Statistical Inference II' },
          { code: 'APMA 1690', title: 'Computational Probability and Statistics' },
          { code: 'APMA 1710', title: 'Information Theory' },
          { code: 'APMA 1740', title: 'Recent Applications of Probability and Statistics' },
          { code: 'APMA 1860', title: 'Graphs and Networks' },
          { code: 'APMA 1941D', title: 'Pattern Theory' },
          { code: 'BIOL 1435', title: 'Computational Methods for Studying Demographic History with Molecular Data' },
          { code: 'BIOL 1555', title: 'Methods in Informatics and Data Science for Health' },
          { code: 'CPSY 0450', title: 'Brain Damage and the Mind' },
          { code: 'CPSY 0800', title: 'Language and the Mind' },
          { code: 'CSCI 0535', title: 'Linear Algebra for Machine Learning' },
          { code: 'CSCI 1010', title: 'Theory of Computation' },
          { code: 'CSCI 1570', title: 'Design and Analysis of Algorithms' },
          { code: 'CSCI 1951A', title: 'Data Science' },
          { code: 'CSCI 1951Q', title: 'Topics in Programming Languages' },
          { code: 'ENGN 2912P', title: 'Topics in Optimization' },
          { code: 'MATH 1210', title: 'Probability' },
          { code: 'PHYS 1610', title: 'Biological Physics' },
        ],
        footnote:
          'Recommended list. Any course already listed for the concentration also counts, but can’t double-count with a named requirement. Two semesters of independent study (NEUR 1970 or equivalent) can replace one elective.',
      },
    ],
  },
  {
    id: 'capstone',
    title: 'Capstone',
    requirements: [
      {
        id: 'capstone',
        title: 'Capstone',
        take: 1,
        options: [{ code: 'NEUR 1900', title: 'Capstone' }],
      },
    ],
  },
];

export const stageCourseCount = (stage: Stage) => stage.requirements.reduce((n, r) => n + r.take, 0);
