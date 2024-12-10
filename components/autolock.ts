import main from "main";
import { App, Notice } from "obsidian";
import { ModalEnterPassword } from "./modalEnterPassword";
import { FolderLock } from "./folderLock";

export class AutoLock {
	app: App;
	plugin: main;
	userActive: boolean;
	idleTimeout: NodeJS.Timeout;
	isAlreadyOpen: boolean;
	minutes: string;

	constructor(app: App, plugin: main, minutes: string) {
		this.app = app;
		this.plugin = plugin;
		this.userActive = true;
		this.isAlreadyOpen = false;
		this.minutes = minutes;
	}

	async startTimer() {
		document.addEventListener(
			"mousedown",
			this.handleUserActivity.bind(this)
		);

		document.addEventListener(
			"keydown",
			this.handleUserActivity.bind(this)
		);

		this.handleUserActivity();
	}

	handleUserActivity() {
		clearTimeout(this.idleTimeout);
		const settings = this.plugin.settings;

		if (!settings.isLocked && this.minutes !== "0") {
			this.idleTimeout = setTimeout(() => {
				if (settings.folder) {
					new FolderLock(this.app, this.plugin).closeOnLocked();
					new Notice(`'${settings.folder}' "folder is locked 🔒`);
				} else {
					new ModalEnterPassword(this.app, this.plugin).open();
				}
			}, Number(this.minutes) * 60000);
		}
	}
}
