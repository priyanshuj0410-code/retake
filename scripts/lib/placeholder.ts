/**
 * A placeholder a player must never see (X-16): a pending marker, an editor's note, a stub. The
 * same pattern reads the content files, the disclosure and every rendered screen.
 */
export const PLACEHOLDER =
  /PENDING|PLACEHOLDER|\[placeholder|\[[A-Z][A-Z _-]{2,}[:\]]|\[(todo|tbd|tk|tbc|fixme|insert|add|source)\b|\bTODO\b|\bTBD\b|\bTKTK\b|\bFIXME\b|XXX|[Ll]orem ipsum|[Oo]wner('s)? wording|\{\{|\}\}|\[\[|\]\]/

/** The words alone, for source code, where brackets and braces are syntax. */
export const PLACEHOLDER_WORDS =
  /\bPENDING\b|\bPLACEHOLDER\b|\bTODO\b|\bTBD\b|\bTKTK\b|\bFIXME\b|[Ll]orem ipsum|[Oo]wner('s)? wording/
