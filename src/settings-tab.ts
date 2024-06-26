import { App, PluginSettingTab, Setting } from "obsidian";
import MultipleDailyNotes from "./main";
import { SettingsModal } from "./settings-modal";
import { addNote, deleteNote, updateNote } from "./models/settings";

export class SettingsTab extends PluginSettingTab {
  plugin: MultipleDailyNotes;

  constructor(app: App, plugin: MultipleDailyNotes) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.plugin.settings.dailyNotes.forEach((dailyNote) => {
      const setting = new Setting(containerEl);
      containerEl.createDiv({ text: dailyNote.name });

      setting
        .addExtraButton((button) => {
          button
            .setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              deleteNote(this.plugin, dailyNote);
              this.display();
            });
        })
        .addExtraButton((button) => {
          button
            .setIcon("pencil")
            .setTooltip("Edit")
            .onClick(async () => {
              new SettingsModal(this.plugin, dailyNote)
                .onSubmit(async (note) => {
                  updateNote(this.plugin, note);
                  this.display();
                })
                .open();
            });
        });
    });

    new Setting(containerEl).addButton((button) => {
      return button
        .setButtonText("Add")
        .setCta()
        .onClick(() => {
          new SettingsModal(this.plugin, {
            id: new Date().getTime().toString(),
            icon: "",
            name: "",
            template: "",
            folder: "",
            noteNameTemplate: "YYYY-MM-DD",
            notePeriod: "day",
          })
            .onSubmit(async (dailyNote) => {
              addNote(this.plugin, dailyNote);
              this.display();
            })
            .open();
        });
    });

    containerEl.createDiv({
      text: "You must reload Obsidian after adding a new daily note to enable commands and hotkeys",
    });
  }
}

