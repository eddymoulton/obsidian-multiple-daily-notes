import { App, PluginSettingTab, Setting } from "obsidian";
import MultipleDailyNotes from "./main";
import { SettingsModal } from "./settings-modal";
import {
  addNote,
  deleteNote,
  updateNote,
  reorderNotes,
  type NotePeriod,
} from "./models/settings";

export class SettingsTab extends PluginSettingTab {
  plugin: MultipleDailyNotes;

  constructor(app: App, plugin: MultipleDailyNotes) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.plugin.settings.dailyNotes.forEach((dailyNote, index) => {
      const setting = new Setting(containerEl)
        .setName(dailyNote.name)
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
                .onSubmit(async (ribbon) => {
                  updateNote(this.plugin, ribbon);
                  this.display();
                })
                .open();
            });
        });

      this.attachDraggableHandlers(setting, index);
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
            templatedFolder: "",
            noteNameTemplate: "YYYY-MM-DD",
            notePeriod: "day" as NotePeriod,
          })
            .onSubmit(async (dailyNote) => {
              console.log(this.plugin.settings);
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

  attachDraggableHandlers(setting: Setting, index: number) {
    const settingEl = setting.settingEl;
    settingEl.setAttribute("draggable", "true");
    settingEl.style.cursor = "grab";

    settingEl.dataset.index = index.toString();

    settingEl.addEventListener("dragstart", (e: DragEvent) => {
      settingEl.style.opacity = "0.5";
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
      }
    });

    settingEl.addEventListener("dragend", (e: DragEvent) => {
      settingEl.style.opacity = "1";
    });

    settingEl.addEventListener("dragover", (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
      settingEl.style.borderTop = "2px solid var(--interactive-accent)";
    });

    settingEl.addEventListener("dragleave", (e: DragEvent) => {
      settingEl.style.borderTop = "";
    });

    settingEl.addEventListener("drop", async (e: DragEvent) => {
      e.preventDefault();
      settingEl.style.borderTop = "";

      if (e.dataTransfer) {
        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
        const toIndex = index;

        if (fromIndex !== toIndex) {
          await reorderNotes(this.plugin, fromIndex, toIndex);
          this.display();
        }
      }
    });
  }
}

