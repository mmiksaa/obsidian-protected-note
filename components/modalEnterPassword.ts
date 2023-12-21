import ExamplePlugin from "main";
import { App, Modal, Notice, Setting } from "obsidian";

export class ModalEnterPassword extends Modal {
	plugin: ExamplePlugin;
	value: string;
	description: string;
	onSubmit?: () => void;
	submited: boolean;

	constructor(app: App, plugin: ExamplePlugin, onSubmit?: () => void) {
		super(app);
		this.plugin = plugin;
		this.value = "";
		this.onSubmit = onSubmit;
		this.submited = false;
	}

	onOpen() {
		const { modalEl, contentEl } = this; //take modal and modal_content (as HTML elements)
		contentEl.empty(); //clear the old content because modal reopen when we click outside

		// get the app-container and give it a class to give the blur-effect
		const app_container = document.querySelector(".app-container");
		app_container?.classList.add("app-container__lock_password");

		modalEl.classList.add("password_modal");

		contentEl.createEl("h1", { text: "Valid the user" });
		const title = contentEl.querySelector("h1");

		if (title) {
			//we make that to give our emoji animation
			title.innerHTML = `${title.textContent} <span class="password_modal__icon">🔒</span>`;
		}

		//delete the close button
		const close_btn = document.querySelector(
			".password_modal .modal-close-button"
		);

		if (close_btn && !this.plugin.canCancleModal) {
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

		//README: its really needed. IDK why but when obsidian starts to work
		//our focuse always disappears. If i set timeout the focus works
		setTimeout(() => {
			password_input.focus();
		}, 200);

		new Setting(contentEl)
			.setName("Please enter your password to verify")
			.setClass("password_modal__inner")
			.addButton((btn) =>
				btn
					.setButtonText("SUBMIT")
					.setCta()
					.onClick(() => {
						this.comparePassword();
					})
			);

		password_input.addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				this.comparePassword();
			}
		});
	}

	async comparePassword() {
		if (this.value !== this.plugin.settings.password) {
			//if the password isnt correct

			const desc = document.querySelector(
				".password_modal__inner .setting-item-info .setting-item-name"
			);

			if (desc) {
				desc.textContent = "Sorry wrong password. Please try again";
				desc.classList.add("password_modal__alert");
			}

			const icon = document.querySelector(".password_modal__icon");

			//if animations are set to false, it is not shown.
			if (this.plugin.settings.animations) {
				//repeatble animation trick
				if (icon) icon.removeClass("password_modal__shake_anim");
				setTimeout(function () {
					if (icon) icon.addClass("password_modal__shake_anim");
				}, 10);
			}
		} else {
			if (this.plugin.settings.animations) {
				const icon = document.querySelector(".password_modal__icon");

				if (icon) icon.textContent = "🔓";
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			//we use submited in case we clicked out our password modal
			this.submited = true;
			this.plugin.toggleFlag = false;
			this.close();
		}
	}

	onClose() {
		const passMatch = this.value === this.plugin.settings.password;

		if ((passMatch && this.submited) || this.plugin.canCancleModal) {
			//if our password is right and we submitted the modal
			//or the user can simply close the modal by clicking outside

			//notifications
			if (passMatch && !this.plugin.canCancleModal) {
				new Notice("you confirmed your password ✔");
			} else if (
				passMatch &&
				this.plugin.canCancleModal &&
				this.submited
			) {
				new Notice("you turned off password protection ❌");
			}

			//remove blur effect
			const app_container = document.querySelector(".app-container");
			app_container?.classList.remove("app-container__lock_password");

			if (this.plugin.settings.animations) {
				const containerBlur = document.querySelector(
					".app-container"
				) as HTMLDivElement;
				if (containerBlur) containerBlur.style.animation = "blur 0.3s";
			}

			if (this.onSubmit) {
				this.onSubmit();
			}
		} else if (!passMatch || !this.submited) {
			this.open(); //reopen the modal if we clicked outside
		}
	}
}
