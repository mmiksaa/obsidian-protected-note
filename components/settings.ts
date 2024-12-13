import main from "../main";
import { ModalEnterPassword } from "components/modalEnterPassword";
import { ModalSetPassword } from "components/modalSetPassword";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";

export interface PluginSettings {
	password: string;
	enablePass: boolean;
	animations: boolean;
	fileEncrypt: { encrypt: boolean; isAlreadyEncrypted: boolean };
	autoLock: string;
	folder: string;
	isLocked: boolean;
}

export const DEFAULT_SETTINGS: Partial<PluginSettings> = {
	password: "",
	enablePass: false,
	animations: true,
	fileEncrypt: { encrypt: false, isAlreadyEncrypted: false },
	autoLock: "0",
	folder: "",
	isLocked: false,
};

export class SettingsTab extends PluginSettingTab {
	plugin: main;

	constructor(app: App, plugin: main) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty(); //clear the old content settings reopen when we open it again

		this.containerEl.createEl("h2", {
			text: "Set a password",
		});

		new Setting(containerEl)
			.setName("Enable/Disable the password")
			.setDesc(
				"To disable protection you need to confirm the password. If you want to create a new password use enable."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enablePass)
					.onChange(async () => {
						if (this.plugin.settings.enablePass) {
							//if we want to disable password

							this.plugin.toggleFlag = true;

							const modal = new ModalEnterPassword(
								this.app,
								this.plugin,
								true,
								async () => {
									if (!this.plugin.toggleFlag) {
										this.plugin.settings.enablePass = false;
										this.plugin.settings.password = "";
										this.plugin.settings.autoLock = "0";
										this.plugin.settings.fileEncrypt.encrypt =
											false;
										this.plugin.settings.fileEncrypt.isAlreadyEncrypted =
											false;
										await this.plugin.saveSettings();

										new Notice(
											"you turned off the password protection ❌"
										);
									}

									this.display(); //display again in case our toggle changed but "if" didn't go
								},
								() => {},
								true
							);

							modal.open();
						} else {
							//open the modal
							const modal = new ModalSetPassword(
								this.app,
								this.plugin,
								async () => {
									//if our toggle flag is true we do our code
									if (this.plugin.toggleFlag) {
										this.plugin.settings.enablePass = true;
										await this.plugin.saveSettings();
									}
									this.display();
								}
							);

							modal.open();
						}
					})
			);

		this.containerEl.createEl("h2", {
			text: "Other",
		});

		new Setting(containerEl)
			.setName("Protected folder")
			.setDesc(
				"Enter the path to protect only a specific folder. Leave the field empty if you want to protect the entire Obsidian."
			)
			.addText((text) => {
				text.setPlaceholder("Example: folder/myFolder")
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						const path =
							value[value.length - 1] === "/"
								? value.slice(0, -1)
								: value;
						this.plugin.settings.folder = path;
						await this.plugin.saveSettings();
					});
			})
			.setDisabled(this.plugin.settings.enablePass);

		new Setting(containerEl)
			.setName("Auto lock")
			.setDesc(
				"The number of minutes before locking if you're not active. Set 0 if you dont want to use auto lock"
			)
			.addText((text) => {
				text.setValue(this.plugin.settings.autoLock).onChange(
					async (value) => {
						if (/^\d+$/.test(value)) {
							this.plugin.settings.autoLock = value;
							await this.plugin.saveSettings();
						}
					}
				);
			});

		new Setting(containerEl)
			.setName("Show animations")
			.setDesc(
				"Enable this if you want to see modal and background animations."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.animations)
					.onChange(async (value) => {
						this.plugin.settings.animations = value;
						await this.plugin.saveSettings();
					});
			});

		this.containerEl.createEl("h2", {
			text: "🛆 High files protection (beta)",
		});

		new Setting(containerEl)
			.setName("File encryption")
			.setDesc(
				"This setting will encrypt all your files. Warning: be sure you made backup before starting using this setting. This setting is on beta!"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.fileEncrypt.encrypt)
					.setDisabled(!this.plugin.settings.password)
					.onChange(async (value) => {
						this.plugin.settings.fileEncrypt.encrypt = value;
						await this.plugin.saveSettings();

						if (value) {
							new Notice("High file protection is turned on 💾");
						} else {
							new Notice("High file protection is turned off ❌");
						}
					})
			);
	}
}
