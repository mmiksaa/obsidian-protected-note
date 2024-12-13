import { Notice, Plugin, addIcon } from "obsidian";
import { ModalEnterPassword } from "./components/modalEnterPassword";
import {
	DEFAULT_SETTINGS,
	PluginSettings,
	SettingsTab,
} from "./components/settings";
import { lockSVG } from "./components/svgIcons";
import { AutoLock } from "components/autolock";
import { FolderLock } from "components/folderLock";

export default class PasswordPlugin extends Plugin {
	settings: PluginSettings;
	toggleFlag: boolean;

	async onload() {
		await this.loadSettings();

		const folderLock = new FolderLock(this.app, this);
		const modalEnterPassword = new ModalEnterPassword(this.app, this);

		this.app.workspace.onLayoutReady(async () => {
			if (this.settings.enablePass && !this.settings.folder) {
				modalEnterPassword.open();
			}

			if (this.settings.enablePass && this.settings.folder) {
				folderLock.lock();
				folderLock.closeOnLocked();
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
			const settings = this.settings;

			if (this.settings.enablePass) {
				if (!settings.folder) {
					modalEnterPassword.open();
				} else {
					folderLock.closeOnLocked();
					this.saveSettings();
					new Notice(`'${settings.folder}' folder is locked 🔒`);
				}
			} else {
				new Notice(
					"You must set a password if you want to use protection!"
				);
			}
		});

		//creating our settings
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() {
		this.settings.enablePass = false;
		this.settings.password = "";
		this.settings.autoLock = "0";

		this.saveSettings();
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
