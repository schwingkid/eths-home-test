// YTC curriculum catalog — served to verified members via /api/portal-content.
// Source of truth: Google Drive "Course 1/2/3" folders (Sept 2024 set, updated June 2026).
// Classroom: Course 1 migrated by Andrea Isita (June 2026).

export const CLASSROOM = {
  title: 'YTC on Google Classroom',
  note: 'Course 1 is live in Google Classroom. Join with the class code, then lessons and meetings appear there.',
  url: 'https://classroom.google.com/c/ODY4MDQ1MzM5NTQy?cjc=y6rgx4pf',
  joinCode: 'y6rgx4pf',
};

export const COURSES = [
  {
    key: 'course1',
    title: 'Course 1: What is Electricity?',
    folder: 'https://drive.google.com/drive/folders/1ERiybxLIbj5L44Jj8kdRDzBlzncfutZz',
    quizzes: 'https://drive.google.com/drive/folders/1pla8QuXSbzBdXx5RXvq2q2PT3agQejZu',
    lessons: [
      { title: 'Lesson 1', url: 'https://docs.google.com/presentation/d/1eShsRmUw76SA0jKZNwOWzU4w840HfiKaFCxVOYKqAUg/edit' },
      { title: 'Lesson 2', url: 'https://docs.google.com/presentation/d/13lH1dzLDhiAY7-e7A4Lx-TqKue8Mf5cbIAIyZjjKcCA/edit' },
      { title: 'Lesson 3', url: 'https://docs.google.com/presentation/d/1ieTcbvbXloRpBsnJgzZ7dxgzodbpb1sH2Ichep-VV4k/edit' },
      { title: 'Lesson 4', url: 'https://docs.google.com/presentation/d/1oStTERp1oJC3XFPDhzh8D08FTM8x2d3FvTFmqChm4C8/edit' },
      { title: 'Lesson 5', url: 'https://docs.google.com/presentation/d/15pQ0P89DVbXOIUBpNH6An3WcnEw12ErPVlm-gtcHu30/edit' },
      { title: 'Lesson 6', url: 'https://docs.google.com/presentation/d/1UGURJ5lbFYtQaeRGfBisKiP2hZXCRGVImh4raCXfZRw/edit' },
    ],
  },
  {
    key: 'course2',
    title: 'Course 2: Making Things Work',
    folder: 'https://drive.google.com/drive/folders/1OKNjWJHfZ47V3BF_3vBjqebJMJogP5RP',
    quizzes: 'https://drive.google.com/drive/folders/1JpNHBMe47MeDm6Bgm65tyrJmOQ348NPs',
    lessons: [
      { title: 'Lab 1', url: 'https://docs.google.com/presentation/d/1AnYUtSDaDI8HxA5VITtbHOUhsq518Uho5nkRCle2OYg/edit' },
      { title: 'Lab 2', url: 'https://docs.google.com/presentation/d/1AqReXs9Tbxm5mfqMhuo4_FlVb9lZofKCXK-14GzOhn4/edit' },
      { title: 'Lab 3', url: 'https://docs.google.com/presentation/d/1RcgfCLNr5ZLVURKA4-foE8WgqRLZqtEzZGQhkdca9UM/edit' },
      { title: 'Lab 4', url: 'https://docs.google.com/presentation/d/1I9Hww-PIrjFRFqlyvjvui2_z_CZWTbMyGGsApfPR0Wc/edit' },
      { title: 'Lab 5', url: 'https://docs.google.com/presentation/d/1prO_7wWGKxSKMxGTTMtvC1unjj-SJyFVCvIBBONMDTQ/edit' },
      { title: 'Lab 6', url: 'https://docs.google.com/presentation/d/1vwJP90hxi5rbUOdQ2TEbnjtbg2fdY0zXHGaUwjOAnAU/edit' },
    ],
  },
  {
    key: 'course3',
    title: 'Course 3: Advanced Labs (Inputs/Outputs)',
    folder: 'https://drive.google.com/drive/folders/1GZIErApopjV6x3wL4F08uTeZ6VLYATGl',
    quizzes: 'https://drive.google.com/drive/folders/1eOwbZz2FQiNzvv2Vd-3n72v-uJPXHTtI',
    lessons: [
      { title: 'Advanced Lab 1', url: 'https://docs.google.com/presentation/d/1gFHOAfN8N28Lg2NBBOonPJDSKpl5CC1JPmdCzQwgE_w/edit' },
      { title: 'Advanced Lab 2', url: 'https://docs.google.com/presentation/d/1v2bMxhagGEptOFwEC2BS9A3i3NInxI2xYtHwv8-OHq0/edit' },
      { title: 'Advanced Lab 3', url: 'https://docs.google.com/presentation/d/1RQrWdEH1N3YsdtnCVHIn4lUpVN7pgPbxv6zv0XST6gA/edit' },
      { title: 'Advanced Lab 4', url: 'https://docs.google.com/presentation/d/1BExNJ8A_rYkVM8cFQMKaPzINYikPBGK_JhuxfK1kKpY/edit' },
      { title: 'Advanced Lab 5', url: 'https://docs.google.com/presentation/d/1n5ZV9ZqY2ZE5qlmXNeXk1B5OZGDac9rpyx_g3OMR1Ss/edit' },
      { title: 'Advanced Lab 6', url: 'https://docs.google.com/presentation/d/1wqK4iLAU81AtE5BLdZovRkmc090pHWAWI7aoo5y2AWk/edit' },
    ],
  },
];
