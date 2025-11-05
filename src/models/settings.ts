import type MultipleDailyNotes from "../main";

export class MultipleDailyNotesSettings {
  dailyNotes!: DailyNoteConfiguration[];
}

export type NotePeriod = "day" | "week" | "year";

export class DailyNoteConfiguration {
  id!: string;
  name!: string;
  icon!: string;
  template!: string;
  folder!: string;
  templatedFolder!: string;
  noteNameTemplate!: string;
  notePeriod!: NotePeriod;
}

export async function deleteNote(
  plugin: MultipleDailyNotes,
  note: DailyNoteConfiguration
) {
  if (!plugin.settings.dailyNotes) {
    return;
  }

  plugin.settings.dailyNotes = plugin.settings.dailyNotes.filter(
    (dailyNote) => dailyNote.id !== note.id
  );

  await plugin.saveData(plugin.settings);
}

export async function updateNote(
  plugin: MultipleDailyNotes,
  note: DailyNoteConfiguration
) {
  if (!plugin.settings.dailyNotes) {
    return;
  }

  plugin.settings.dailyNotes = plugin.settings.dailyNotes.map((dailyNote) => {
    if (dailyNote.id !== note.id) return dailyNote;
    return note;
  });

  await plugin.saveData(plugin.settings);
}

export async function addNote(
  plugin: MultipleDailyNotes,
  note: DailyNoteConfiguration
) {
  plugin.settings.dailyNotes.push(note);

  await plugin.saveData(plugin.settings);
}

export async function reorderNotes(
  plugin: MultipleDailyNotes,
  fromIndex: number,
  toIndex: number
) {
  if (!plugin.settings.dailyNotes) {
    return;
  }

  const notes = [...plugin.settings.dailyNotes];
  const [removed] = notes.splice(fromIndex, 1);
  notes.splice(toIndex, 0, removed);

  plugin.settings.dailyNotes = notes;
  await plugin.saveData(plugin.settings);
}

