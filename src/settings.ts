import { App, PluginSettingTab, Setting } from "obsidian";
import NoteArchiverPlugin from "./main";

export interface NoteArchiverPluginSettings {
	archiveCommandLine: string;
	openFolderAfterArchiving: boolean;
	outputFolderType: "vault" | "note_folder" | "custom";
	customOutputFolder: string;
	outputFileName: string;
}

export const DEFAULT_SETTINGS: NoteArchiverPluginSettings = {
	archiveCommandLine: "",
	openFolderAfterArchiving: true,
	outputFolderType: "vault",
	customOutputFolder: "",
	outputFileName: "{note_name}",
};

export class NoteArchiverSettingTab extends PluginSettingTab {
	plugin: NoteArchiverPlugin;

	constructor(app: App, plugin: NoteArchiverPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Archive Command Line")
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter the command line for archiving notes"
					)
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.archiveCommandLine)
					.onChange(async (value) => {
						this.plugin.settings.archiveCommandLine = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Open Folder After Archiving")
			.setDesc(
				"If enabled, the folder containing the archived note will be opened after archiving."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openFolderAfterArchiving)
					.onChange(async (value) => {
						this.plugin.settings.openFolderAfterArchiving = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Output File Name")
			.setDesc(
				"Specify the output file name. You can use {note_name} as a placeholder for the original note name."
			)
			.addText((text) =>
				text
					.setPlaceholder("{note_name}")
					.setValue(this.plugin.settings.outputFileName)
					.onChange(async (value) => {
						this.plugin.settings.outputFileName = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Output Folder Type")
			.setDesc("Choose where the archived notes will be saved.")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("vault", "Vault Root")
					.addOption("note_folder", "Same Folder as Note")
					.addOption("custom", "Custom Folder")
					.setValue(this.plugin.settings.outputFolderType)
					.onChange(async (value) => {
						this.plugin.settings.outputFolderType = value as any;
						await this.plugin.saveSettings();
						this.display();
					})
			);
		if (this.plugin.settings.outputFolderType === "custom") {
			new Setting(containerEl)
				.setName("Custom Output Folder")
				.setDesc(
					"Specify the custom folder path relative to the vault root."
				)
				.addText((text) =>
					text
						.setPlaceholder("e.g., Archived Notes")
						.setValue(this.plugin.settings.customOutputFolder)
						.onChange(async (value) => {
							this.plugin.settings.customOutputFolder = value;
							await this.plugin.saveSettings();
						})
				);
		}
	}
}
