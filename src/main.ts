import { Menu, Plugin, TFile } from "obsidian";
import {
  MultipleDailyNotesSettings,
  DailyNoteConfiguration,
} from "./models/settings";
import { SettingsTab } from "./settings-tab";

export default class MultipleDailyNotes extends Plugin {
  settings: MultipleDailyNotesSettings;

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
    console.log("saved data");
    console.log(await this.loadData());

    this.settings = Object.assign(
      {},
      { dailyNotes: [] },
      await this.loadData()
    );

    console.log("settings");
    console.log(this.settings);
  }

  public async saveSettings() {
    console.log("saving data");
    console.log(this.settings);
    await this.saveData(this.settings);
  }

  private async createOrOpenTodaysFile(note: DailyNoteConfiguration) {
    if (!note.folder) {
      return;
    }

    console.log(note.folder);

    this.app.vault.createFolder(note.folder);

    const path = `${note.folder}/${window
      .moment()
      .format(note.noteNameTemplate)}.md`;

    const result = await this.copyFromTemplate(path, note.template);

    if (result) {
      this.app.workspace.getLeaf().openFile(result);
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

