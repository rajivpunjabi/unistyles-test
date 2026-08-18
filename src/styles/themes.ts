/**
 * Theme definitions for unistyles v2.
 *
 * Each theme carries a 12-step neutral color scale following the Radix scale
 * semantics (https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
 * plus semantic aliases mapping the raw steps to their intended role.
 */

type ColorScale = {
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;
  step7: string;
  step8: string;
  step9: string;
  step10: string;
  step11: string;
  step12: string;
};

const NEUTRAL_LIGHT: ColorScale = {
  step1: '#fbfcfd',
  step2: '#f8f9fa',
  step3: '#f1f3f5',
  step4: '#eceef0',
  step5: '#e6e8eb',
  step6: '#dfe3e6',
  step7: '#d7dbdf',
  step8: '#c1c8cd',
  step9: '#889096',
  step10: '#7e868c',
  step11: '#687076',
  step12: '#11181c',
};

const NEUTRAL_DARK: ColorScale = {
  step1: '#151718',
  step2: '#1a1d1e',
  step3: '#202425',
  step4: '#26292b',
  step5: '#2b2f31',
  step6: '#313538',
  step7: '#3a3f42',
  step8: '#4c5155',
  step9: '#697177',
  step10: '#787f85',
  step11: '#9ba1a6',
  step12: '#ecedee',
};

function buildTheme(neutral: ColorScale) {
  return {
    colors: {
      neutral,
      // Backgrounds (steps 1-2)
      background: neutral.step1,
      backgroundSubtle: neutral.step2,
      // Component backgrounds (steps 3-5)
      element: neutral.step3,
      elementHover: neutral.step4,
      elementActive: neutral.step5,
      // Borders (steps 6-8)
      border: neutral.step6,
      borderInteractive: neutral.step7,
      borderStrong: neutral.step8,
      // Solid backgrounds (steps 9-10)
      solid: neutral.step9,
      solidHover: neutral.step10,
      // Text (steps 11-12)
      textMuted: neutral.step11,
      text: neutral.step12,
    },
    gap: (v: number) => v * 8,
  };
}

const lightTheme = buildTheme(NEUTRAL_LIGHT);
const darkTheme = buildTheme(NEUTRAL_DARK);

export { darkTheme, lightTheme };
