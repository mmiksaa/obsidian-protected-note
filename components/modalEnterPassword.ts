import main from "main";
import { App, Modal, Notice, Setting, moment } from "obsidian";
import { hash } from "./hash";
import { Decrypt } from "./decrypt";
import { Encrypt } from "./encrypt";

export class ModalEnterPassword extends Modal {
	plugin: main;
	value: string;
	description: string;
	submited: boolean;
	lockIcon: HTMLSpanElement;
	onSubmit?: () => void;
	onLeave?: () => void;
	isClosable?: boolean;
	disablingPass?: boolean;
	desc: HTMLDivElement | null;

	constructor(
		app: App,
		plugin: main,
		isClosable?: boolean,
		onSubmit?: () => void,
		onLeave?: () => void,
		disablingPass?: boolean
	) {
		super(app);
		this.plugin = plugin;
		this.value = "";
		this.submited = false;
		this.isClosable = isClosable;
		this.onSubmit = onSubmit;
		this.onLeave = onLeave;
		this.disablingPass = disablingPass;
		this.desc = null;
	}

	async onOpen() {
		this.value = "";
		this.plugin.settings.isLocked = true;
		await this.plugin.saveSettings();

		const { modalEl, contentEl } = this; //take modal and modal_content (as HTML elements)

		contentEl.empty(); //clear the old content because modal reopen when we click outside

		// get the app-container and give it a class to give the blur-effect
		const app_container = document.querySelector(".app-container");
		app_container?.classList.add("app-container__lock_password");

		modalEl.classList.add("password_modal");

		const title = contentEl.createEl("h1", {
			text: "Your password ",
		});
		const lockIcon = title.createEl("span", {
			text: "🔒",
			cls: "password_modal__icon",
		});

		//delete the close button
		const close_btn = document.querySelector(
			".password_modal .modal-close-button"
		);

		if (close_btn && !this.isClosable) {
			this.modalEl.removeChild(close_btn);
		}

		const div_input = contentEl.createDiv();

		//create input and put it inside the div
		const password_input = div_input.createEl("input", {
			type: "password",
			value: this.value,
			placeholder: "Enter your password",
		});

		password_input.classList.add("password_input");

		//give them events
		password_input.addEventListener("input", (event: MouseEvent) => {
			const text = event.target as HTMLInputElement;
			this.value = text.value;
		});

		new Setting(contentEl)
			.setName("Please enter your password to verify")
			.setClass("password_modal__inner")
			.addButton((btn) =>
				btn
					.setButtonText("SUBMIT")
					.setCta()
					.onClick(() => {
						this.comparePassword(lockIcon);
					})
			);

		this.desc = document.querySelector(
			".password_modal__inner .setting-item-name"
		);

		if (
			this.plugin.settings.fileEncrypt.encrypt &&
			!this.plugin.settings.fileEncrypt.isAlreadyEncrypted &&
			!this.disablingPass
		) {
			password_input.disabled = true;

			if (this.desc) this.desc.innerText = "🛆 Encrypting all files..";

			await new Encrypt(this.app, this.plugin).encryptFilesInDirectory();

			password_input.disabled = false;
			if (this.desc)
				this.desc.innerText = "Please enter your password to verify";
		}

		password_input.focus();

		password_input.addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				this.comparePassword(lockIcon);
			}
		});
	}

	async comparePassword(lockIcon: HTMLSpanElement) {
		const input = document.querySelector(
			".password_input"
		) as HTMLInputElement;
		input.value = "";

		if (hash(this.value) !== this.plugin.settings.password) {
			//if the password isnt correct

			this.value = "";

			if (this.desc) {
				this.desc.textContent =
					"Sorry wrong password. Please try again";
				this.desc.classList.add("password_modal__alert");
			}

			//if animations are set to false, it is not shown.
			if (this.plugin.settings.animations) {
				lockIcon.removeClass("shake_anim");

				setTimeout(function () {
					lockIcon.addClass("shake_anim");
				}, 10);
			}
		} else {
			if (this.plugin.settings.animations) {
				lockIcon.textContent = "🔓";
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			if (
				this.plugin.settings.fileEncrypt &&
				this.plugin.settings.fileEncrypt.isAlreadyEncrypted
			) {
				if (this.desc) {
					this.desc.classList.remove("password_modal__alert");
					this.desc.innerText = "🛆 Decrypting all files..";
				}

				input.disabled = true;

				await new Decrypt(
					this.app,
					this.plugin
				).decryptFilesInDirectory();
			}

			//we use submited in case we clicked out our password modal
			this.plugin.settings.isLocked = false;
			this.submited = true;
			this.plugin.toggleFlag = false;
			this.close();
		}
	}

	onClose() {
		const passMatch = hash(this.value) === this.plugin.settings.password;

		if ((passMatch && this.submited) || this.isClosable) {
			//if our password is right and we submitted the modal
			//or the user can simply close the modal by clicking outside

			//remove blur effect
			const app_container = document.querySelector(".app-container");
			app_container?.classList.remove("app-container__lock_password");

			if (this.plugin.settings.animations) {
				const containerBlur = document.querySelector(
					".app-container"
				) as HTMLDivElement;
				if (containerBlur) containerBlur.classList.add("blur");

				//remove blur effect after 5ml second
				setTimeout(() => {
					containerBlur.classList.remove("blur");
				}, 500);
			}

			this.plugin.saveSettings();
			if (!passMatch && this.onLeave) this.onLeave();
			if (this.onSubmit) this.onSubmit();
		} else if (!passMatch || !this.submited) {
			this.open(); //reopen the modal if we clicked outside
		}
	}
}
