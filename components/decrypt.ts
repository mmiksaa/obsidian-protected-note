import main from "main";
import { App } from "obsidian";
import * as CryptoJS from "crypto-js";

export class Decrypt {
	app: App;
	plugin: main;
	counter: number;

	constructor(app: App, plugin: main) {
		this.app = app;
		this.plugin = plugin;
		this.counter = 0;
	}

	async decryptFilesInDirectory() {
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			const content = await this.app.vault.read(file);

			if (content.length > 1) {
				const decryptedContent = this.decryptContent(content);
				await this.app.vault.modify(file, decryptedContent);
			}
		}

		this.plugin.settings.fileEncrypt.isAlreadyEncrypted = false;
		await this.plugin.saveSettings();
	}

	private decryptContent(content: string): string {
		const key = this.plugin.settings.password;

		const decrypted = CryptoJS.AES.decrypt(content, key).toString(
			CryptoJS.enc.Utf8
		);

		return decrypted;
	}
}
