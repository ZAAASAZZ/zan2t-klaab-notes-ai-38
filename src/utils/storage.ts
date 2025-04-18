
interface Notes {
  [subject: string]: {
    [block: string]: string;
  };
}

const STORAGE_KEY = "zan2t-klaab-notes";

export const saveNotes = (notes: Notes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving notes to localStorage:", error);
  }
};

export const loadNotes = (): Notes => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        biology: {},
        chemistry: {},
        ict: {},
        physics: {},
        maths: {},
        english: {},
        arabic: {},
        french: {},
        social: {},
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading notes from localStorage:", error);
    return {
      biology: {},
      chemistry: {},
      ict: {},
      physics: {},
      maths: {},
      english: {},
      arabic: {},
      french: {},
      social: {},
    };
  }
};
