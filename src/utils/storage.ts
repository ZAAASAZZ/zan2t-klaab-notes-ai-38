
interface Notes {
  [subject: string]: {
    [block: string]: string;
  };
}

const STORAGE_KEY = "zan2t-klaab-notes";

export const saveNotes = (notes: Notes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const loadNotes = (): Notes => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      biology: {},
      chemistry: {},
      ict: {},
    };
  }
  return JSON.parse(stored);
};
