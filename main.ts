import { Notice, Plugin, addIcon } from "obsidian";
import { ModalEnterPassword } from "./components/modalEnterPassword";
import {
	DEFAULT_SETTINGS,
	PluginSettings,
	SettingsTab,
} from "./components/settings";
import { lockSVG } from "./components/svgIcons";
import { Encrypt } from "components/encrypt";
import { AutoLock } from "components/autolock";

export default class PasswordPlugin extends Plugin {
	settings: PluginSettings;
	toggleFlag: boolean;
	isLogged: boolean;

	async onload() {
		await this.loadSettings();
		this.isLogged = false;
		// const basePath: string = (this.app.vault.adapter as any).basePath;

		this.app.workspace.onLayoutReady(async () => {
			if (this.settings.enablePass) {
				new ModalEnterPassword(this.app, this).open();
			}

			if (this.settings.enablePass && this.settings.autoLock !== "0") {
				new AutoLock(
					this.app,
					this,
					this.settings.autoLock
				).startTimer();
			}
		});

		//it works only like this.
		const ribbonText = this.settings.fileEncrypt.encrypt
			? "Encrypt the files and block obsidian"
			: "Block Obsidian";

		addIcon("lock127", lockSVG);
		this.addRibbonIcon("lock127", ribbonText, async () => {
			if (this.settings.enablePass) {
				new ModalEnterPassword(this.app, this).open();
			} else {
				new Notice(
					"You must set a password if you want to use protection!"
				);
			}
		});

		//creating our settings
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
