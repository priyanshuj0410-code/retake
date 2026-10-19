import { directItems, screeningItems, surveyItems, xw } from '../content'

/** The answer counts the length estimator needs, read from the content files. */
export const bankCounts = () => ({
  surveyItems: surveyItems.length,
  surveyRepeats: surveyItems.filter((i) => i.repeat).length,
  screeningDirect: screeningItems.filter((i) => i.format === 'direct').length,
  screeningVignettes: screeningItems.filter((i) => i.format === 'vignette').length,
  m1hControls: xw.m1hControls.length,
  m1hStatements: xw.m1hStatements.length,
  m3Items: xw.m3Items.length,
  rcItems: xw.rcItems.length,
  directItems: directItems.length,
  directRepeats: directItems.filter((i) => i.repeat).length,
})
