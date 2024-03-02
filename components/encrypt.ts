import main from "main";
import { App } from "obsidian";
import * as CryptoJS from "crypto-js";

export class Encrypt {
	app: App;
	plugin: main;

	constructor(app: App, plugin: main) {
		this.app = app;
		this.plugin = plugin;
	}

	async encryptFilesInDirectory() {
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			const content = await this.app.vault.read(file);

			if (content.length > 1) {
				const encryptedContent = this.encryptContent(content);
				await this.app.vault.modify(file, encryptedContent);
			}
		}

		this.plugin.settings.fileEncrypt.isAlreadyEncrypted = true;
		await this.plugin.saveSettings();
	}

	private encryptContent(content: string): string {
		const key = this.plugin.settings.password;

		const encrypted = CryptoJS.AES.encrypt(content, key).toString();
		return encrypted;
	}
}
