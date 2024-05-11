import { Modal, Plugin, Setting } from "obsidian";
import { DailyNoteConfiguration } from "./models/settings";

export class SettingsModal extends Modal {
  private dailyNote: DailyNoteConfiguration;

  private onSubmitAction: (dailyNote: DailyNoteConfiguration) => Promise<void>;

  constructor(plugin: Plugin, dailyNote: DailyNoteConfiguration) {
    super(plugin.app);

    this.dailyNote = Object.assign({}, dailyNote);

    this.titleEl.createDiv({
      text: this.dailyNote.name ? this.dailyNote.name : "Create new daily note",
    });
  }

  private createTextField(
    element: HTMLElement,
    name: string,
    description: string | undefined,
    value: string,
    setValue: (value: string) => void
  ) {
    const setting = new Setting(element)
      .setName(name)
      .addText((text) => {
        text.setValue(value).onChange(setValue);
      })
      .setDisabled(false);

    if (description) {
      setting.setDesc(description);
    }
  }

  async display() {
    const root = this.contentEl;

    root.empty();

    const content = root.createDiv();

    this.createTextField(
      content,
      "Icon",
      "Get icon names from lucide.dev",
      this.dailyNote.icon,
      (value) => (this.dailyNote.icon = value)
    );

    this.createTextField(
      content,
      "Name",
      "Display name of this daily note",
      this.dailyNote.name,
      (value) => (this.dailyNote.name = value)
    );

    this.createTextField(
      content,
      "Note template",
      "Relative path to the template file. Must include `.md`",
      this.dailyNote.template,
      (value) => (this.dailyNote.template = value)
    );

    this.createTextField(
      content,
      "Note folder",
      "Relative folder path that this note will be created in",
      this.dailyNote.folder,
      (value) => (this.dailyNote.folder = value)
    );

    this.createTextField(
      content,
      "New file name template",
      "Template to use when naming new files",
      this.dailyNote.noteNameTemplate,
      (value) => (this.dailyNote.noteNameTemplate = value)
    );

    new Setting(content).addButton((button) => {
      return button
        .setButtonText("Save")
        .setCta()
        .onClick(() => {
          this.onSubmitAction?.(this.dailyNote);
          this.close();
        });
    });
  }

  onOpen() {
    this.display();
  }

  onSubmit(fn: (dailyNote: DailyNoteConfiguration) => Promise<void>) {
    this.onSubmitAction = fn;

    return this;
  }
}

