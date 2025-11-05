import { Modal, Setting, setIcon } from "obsidian";
import { DailyNoteConfiguration } from "./models/settings";
import { IconPickerModal } from "./icon-picker";
import type MultipleDailyNotes from "./main";

export class SettingsModal extends Modal {
  private dailyNote: DailyNoteConfiguration;
  private plugin: MultipleDailyNotes;

  private onSubmitAction(dailyNote: DailyNoteConfiguration) {}

  constructor(plugin: MultipleDailyNotes, dailyNote: DailyNoteConfiguration) {
    super(plugin.app);
    this.plugin = plugin;

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

    this.createIconPicker(content);

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
      "Templated folder",
      "Optional date templated folder that will be used within the note folder",
      this.dailyNote.templatedFolder,
      (value) => (this.dailyNote.templatedFolder = value)
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

  private createIconPicker(element: HTMLElement) {
    const setting = new Setting(element)
      .setName("Icon")
      .setDesc("Choose an icon from the Lucide icon set");

    const controlsContainer = setting.controlEl.createDiv({
      cls: "icon-picker-controls",
    });

    const iconPreview = controlsContainer.createDiv({
      cls: "icon-picker-preview",
    });

    if (this.dailyNote.icon) {
      setIcon(iconPreview, this.dailyNote.icon);
    } else {
      iconPreview.createDiv({ text: "No icon selected" });
    }

    const buttonContainer = controlsContainer.createDiv();
    const button = buttonContainer.createEl("button", { text: "Choose Icon" });

    button.addEventListener("click", () => {
      new IconPickerModal(this.plugin, (icon) => {
        this.dailyNote.icon = icon;
        iconPreview.empty();
        setIcon(iconPreview, icon);
      }).open();
    });
  }
}

