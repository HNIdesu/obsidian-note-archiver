import { Notice, Plugin, TFile } from "obsidian";
import * as child_process from "child_process";
import * as os from "os";
import {
	DEFAULT_SETTINGS,
	NoteArchiverPluginSettings,
	NoteArchiverSettingTab,
} from "./settings";
import path from "path";

export default class NoteArchiverPlugin extends Plugin {
	settings: NoteArchiverPluginSettings;

	openFolder(path: string) {
		const platform = os.platform();
		if (platform === "win32") {
			child_process.exec(`start "" "${path}"`);
		} else if (platform === "darwin") {
			child_process.exec(`open "${path}"`);
		} else {
			child_process.exec(`xdg-open "${path}"`);
		}
	}

	getOutputFolder(currentFile: TFile | null): string {
		switch (this.settings.outputFolderType) {
			case "vault":
				return (this.app.vault.adapter as any).basePath;
			case "note_folder":
				return currentFile?.parent?.path!!;
			case "custom":
				return this.settings.customOutputFolder;
			default:
				return (this.app.vault.adapter as any).basePath;
		}
	}

	getOutputFileName(currentFile: TFile | null): string {
		return this.settings.outputFileName.replace(
			"{note_name}",
			currentFile?.basename ?? "archived_note"
		);
	}

	async onload() {
		await this.loadSettings();
		const app = this.app;
		const plugin = this;
		const settings = this.settings;
		this.addCommand({
			id: "archive-current-note",
			name: "Archive Current Note",
			checkCallback(checking) {
				const currentFile = app.workspace.getActiveFile();
				if (checking) {
					return currentFile !== null;
				} else {
					if (settings.archiveCommandLine === "") {
						new Notice(
							"Archive command line is not set. Please set it in the plugin settings."
						);
						return;
					}
					if (currentFile) {
						const fileList = new Set<string>([`"${currentFile.path}"`]);
						for (const embed of app.metadataCache.getCache(
							currentFile.path
						)?.embeds ?? [])
							fileList.add(`"${embed.link}"`);
						const commandLine = settings.archiveCommandLine;
						const outputFolder =
							plugin.getOutputFolder(currentFile);
						child_process.exec(
							commandLine
								.replace("{file_list}", Array.from(fileList).join(" "))
								.replace(
									"{output_path}",
									path.join(
										outputFolder,
										plugin.getOutputFileName(currentFile)
									)
								),
							{
								cwd: (app.vault.adapter as any).basePath,
							},
							(err) => {
								if (err) {
									console.error(err);
									new Notice("Failed to execute the command");
								} else {
									if (settings.openFolderAfterArchiving) {
										plugin.openFolder(outputFolder);
									}
								}
							}
						);
						return true;
					} else return false;
				}
			},
		});

		this.addSettingTab(new NoteArchiverSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<NoteArchiverPluginSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
