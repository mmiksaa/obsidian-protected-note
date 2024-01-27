import { Notice, Plugin, addIcon, setIcon } from "obsidian";
import { ModalEnterPassword } from "./components/modalEnterPassword";
import { SettingsTab } from "./components/settings";
import { lockSVG } from "./components/svgIcons";

interface PluginSettings {
	password: string;
	enablePass: boolean;
	animations: boolean;
	hideRibbonIcon: boolean;
}

const DEFAULT_SETTINGS: Partial<PluginSettings> = {
	password: "",
	enablePass: false,
	animations: true,
	hideRibbonIcon: false,
};

export default class PasswordPlugin extends Plugin {
	settings: PluginSettings;
	toggleFlag: boolean;
	canCancleModal: boolean;

	async onload() {
		await this.loadSettings();
		this.canCancleModal = false;

		if (this.settings.enablePass) {
			new ModalEnterPassword(this.app, this).open();
		}

		//it works only like this.

		addIcon("lock127", lockSVG);
		this.addRibbonIcon("lock127", "Block Obsidian", () => {
			if (this.settings.enablePass) {
				new ModalEnterPassword(this.app, this).open();
			} else {
				new Notice(
					"You must set a password if you want to use protection!"
				);
			}
		});

		//create our settings
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
