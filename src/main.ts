import { Menu, Plugin, TFile } from "obsidian";
import {
  MultipleDailyNotesSettings,
  DailyNoteConfiguration,
} from "./models/settings";
import { SettingsTab } from "./settings-tab";

export default class MultipleDailyNotes extends Plugin {
  settings: MultipleDailyNotesSettings = new MultipleDailyNotesSettings();

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("list-plus", "Daily notes", async (event) => {
      const menu = new Menu();

      this.settings.dailyNotes.forEach((note) => {
        menu.addItem((item) => {
          return item
            .setTitle(note.name)
            .setIcon(note.icon)
            .onClick(() => this.createOrOpenTodaysFile(note));
        });
      });

      menu.showAtMouseEvent(event);
    });

    this.settings.dailyNotes.forEach((note) => {
      this.addCommand({
        id: `multiple-daily-notes-${note.id}`,
        name: `Open daily note: ${note.name}`,
        callback: () => this.createOrOpenTodaysFile(note),
      });
    });

    this.addSettingTab(new SettingsTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      { dailyNotes: [] },
      await this.loadData()
    );
  }

  public async saveSettings() {
    await this.saveData(this.settings);
  }

  private async createOrOpenTodaysFile(note: DailyNoteConfiguration) {
    if (!note.folder) {
      return;
    }

    let dateToUse = window.moment();

    switch (note.notePeriod) {
      case "year":
        dateToUse = dateToUse.dayOfYear(1);
        break;
      case "week":
        dateToUse = dateToUse.weekday(2);
        break;
    }

    var folder = note.folder;

    if (note.templatedFolder) {
      const folderPath = dateToUse.format(note.templatedFolder);
      folder = `${folder}/${folderPath}`;
    }

    if (!this.app.vault.getFolderByPath(folder)) {
      this.app.vault.createFolder(folder);
    }

    const path = `${folder}/${dateToUse.format(note.noteNameTemplate)}.md`;
    const copy = await this.copyFromTemplate(path, note.template);

    if (copy) {
      this.app.workspace.getLeaf().openFile(copy);
    }
  }

  public async copyFromTemplate(
    path: string,
    templatePath: string
  ): Promise<TFile | null> {
    const desiredFile = this.app.vault.getFileByPath(path);
    const templateFile = this.app.vault.getFileByPath(templatePath);

    if (!desiredFile) {
      const templateContent = templateFile
        ? await this.app.vault.read(templateFile)
        : "";

      const file = await this.app.vault.create(path, templateContent);

      return file;
    } else if (desiredFile instanceof TFile) {
      return desiredFile;
    }

    return null;
  }
}

