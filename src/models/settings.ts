import MultipleDailyNotes from "src/main";

export class MultipleDailyNotesSettings {
  dailyNotes: DailyNoteConfiguration[];
}

export class DailyNoteConfiguration {
  id: string;
  name: string;
  icon: string;
  template: string;
  folder: string;
  noteNameTemplate: string;
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

