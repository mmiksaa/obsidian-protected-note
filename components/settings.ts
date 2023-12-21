import ExamplePlugin from "../main";
import { ModalEnterPassword } from "components/modalEnterPassword";
import { ModalSetPassword } from "components/modalSetPassword";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";

export class SettingsTab extends PluginSettingTab {
	plugin: ExamplePlugin;

	constructor(app: App, plugin: ExamplePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty(); //clear the old content settings reopen when we open it again

		new Setting(containerEl)
			.setName("Disable/Enable the password")
			.setDesc(
				"To Disable protection you need to confirm the password. If you want to create a new password use Enable."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enablePass)
					.onChange(async () => {
						if (this.plugin.settings.enablePass) {
							//if we want to disable password

							this.plugin.toggleFlag = true;
							this.plugin.canCancleModal = true;

							const modal = new ModalEnterPassword(
								this.app,
								this.plugin,
								async () => {
									if (!this.plugin.toggleFlag) {
										this.plugin.settings.enablePass = false;
										await this.plugin.saveSettings();
									}

									this.plugin.canCancleModal = false;

									this.display(); //display again in case our toggle changed but "if" didn't go
								}
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

		new Setting(containerEl)
			.setName("Hide ribbon icon")
			.setDesc("Show the obsidian blocking icon on the hide ribbon.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.hideRibbonIcon)
					.onChange(async (value) => {
						new Notice(
							"restart obsidian if you want the changes to take effect."
						);

						this.plugin.settings.hideRibbonIcon = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
