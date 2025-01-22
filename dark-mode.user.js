// ==UserScript==
// @name         Dark mode
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Invert color of the page
// @author       PioLeg
// @match        *://*/*
// @icon         https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fdownload%2Fblack%2Fsun-3-128.gif&f=1&nofb=1&ipt=45c4461b37bc7d3ffc99847e3ae5cd80f7c33a39e21fa42ac2becbda6b100d94&ipo=images
// @grant        GM_addStyle
// @run-at       document-start
// @downloadURL  https://github.com/pioleg/dark-mode/raw/master/dark-mode.user.js
// @updateURL    https://github.com/pioleg/dark-mode/raw/master/dark-mode.user.js
// ==/UserScript==


var style, pick;
var css = {
	html:`
html {
    filter: invert(100%) hue-rotate(180deg);
}
.darkmode {
    filter: invert(100%) hue-rotate(180deg);
}`,
	img:`
html img {
    filter: invert(100%) hue-rotate(180deg);
}`,
	video:`
video {
    filter: invert(100%) hue-rotate(180deg);
}`,
	iframe:`
iframe {
    filter: invert(100%) hue-rotate(180deg);
}`,
	wikipedia:`
.mwe-math-element img, span img.mw-file-element {
    filter: none;
}
.tmulti img.mw-file-element, .infobox-image span img.mw-file-element {
    filter: invert(100%) hue-rotate(180deg);
}`,
	imagus:`
body+div {
    filter: invert(100%) hue-rotate(180deg);
}
body+div * {
    filter: none;
}`
}

// Turn Dark mode on or off
function darkmode(on)
{
	const nodeList = document.querySelectorAll('[style*="background-image"]');
	if(on) {
		if (window.location.hostname.endsWith('wikipedia.org')) {
			style = GM_addStyle(css.html+css.img+css.video+css.iframe+css.wikipedia+css.imagus);
		} else {
			style = GM_addStyle(css.html+css.img+css.video+css.iframe+css.imagus);
		}
		for (let i = 0; i < nodeList.length; i++) {
			nodeList[i].style.filter += "invert(100%) hue-rotate(180deg)";
		}
		console.log(style);
		console.log(nodeList);
	} else {
		style.remove();
		style = null;
		for (let i = 0; i < nodeList.length; i++) {
			nodeList[i].style.filter = nodeList[i].style.filter.replace('invert(100%) hue-rotate(180deg)', '');
		}
	}
}



// Check if dark mode should be enabled
if (localStorage.darkmode) {
	darkmode(1);
}

// Synchronize on tab change
document.addEventListener('visibilitychange', e => {
	if (localStorage.darkmode && !style) {
		darkmode(1);
	}
	if (!localStorage.darkmode && style) {
		darkmode(0);
	}
});

// Toggle when pressing Ctrl+`
document.addEventListener('keydown', e => {
	if (e.ctrlKey && e.key === '~') {
		if (!pick) {
			pick = true
			picker.start({
				onHover: (el) => {
				},
				onClick: (el) => {
					el.classList.toggle('darkmode')
					const tags = [];
					while (el.parentNode) {
						tags.push(el.tagName);
						el = el.parentNode;
					}
					console.log(tags.reverse().map((t) => t.toLowerCase()).join(" > "))
				}
			});
		} else {
			pick = false
			picker.stop();
		}
	}
	if (e.ctrlKey && e.key === '`') {
		if (!localStorage.darkmode) {
			localStorage.darkmode = 1;
			darkmode(1);
		} else {
			delete localStorage.darkmode;
			darkmode(0);
		}
	}
});



// dom-element-picker
// https://www.cssscript.com/dom-element-picker/
// https://github.com/hmarr/pick-dom-element/

class ElementPicker {
	constructor(overlayOptions) {
		this.handleMouseMove = (event) => {
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
		};
		this.handleClick = (event) => {
			var _a;
			if (this.target && ((_a = this.options) === null || _a === void 0 ? void 0 : _a.onClick)) {
				this.options.onClick(this.target);
			}
			event.preventDefault();
		};
		this.tick = () => {
			this.updateTarget();
			this.tickReq = window.requestAnimationFrame(this.tick);
		};
		this.active = false;
		this.overlay = new ElementOverlay(overlayOptions !== null && overlayOptions !== void 0 ? overlayOptions : {});
	}
	start(options) {
		var _a, _b;
		if (this.active) {
			return false;
		}
		this.active = true;
		this.options = options;
		document.addEventListener("mousemove", this.handleMouseMove, true);
		document.addEventListener("click", this.handleClick, true);
		this.overlay.addToDOM((_a = options.parentElement) !== null && _a !== void 0 ? _a : document.body, (_b = options.useShadowDOM) !== null && _b !== void 0 ? _b : true);
		this.tick();
		return true;
	}
	stop() {
		this.active = false;
		this.options = undefined;
		document.removeEventListener("mousemove", this.handleMouseMove, true);
		document.removeEventListener("click", this.handleClick, true);
		this.overlay.removeFromDOM();
		this.target = undefined;
		this.mouseX = undefined;
		this.mouseY = undefined;
		if (this.tickReq) {
			window.cancelAnimationFrame(this.tickReq);
		}
	}
	updateTarget() {
		var _a, _b;
		if (this.mouseX === undefined || this.mouseY === undefined) {
			return;
		}
		// Peek through the overlay to find the new target
		this.overlay.ignoreCursor();
		const elAtCursor = document.elementFromPoint(this.mouseX, this.mouseY);
		const newTarget = elAtCursor;
		this.overlay.captureCursor();
		// If the target hasn't changed, there's nothing to do
		if (!newTarget || newTarget === this.target) {
			return;
		}
		// If we have an element filter and the new target doesn't match,
		// clear out the target
		if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.elementFilter) {
			if (!this.options.elementFilter(newTarget)) {
				this.target = undefined;
				this.overlay.setBounds({ x: 0, y: 0, width: 0, height: 0 });
				return;
			}
		}
		this.target = newTarget;
		const bounds = getElementBounds(newTarget);
		this.overlay.setBounds(bounds);
		if ((_b = this.options) === null || _b === void 0 ? void 0 : _b.onHover) {
			this.options.onHover(newTarget);
		}
	}
}

class ElementOverlay {
	constructor(options) {
		var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
		this.overlay = document.createElement("div");
		this.overlay.className = options.className || "_ext-element-overlay";
		this.overlay.style.background = ((_a = options.style) === null || _a === void 0 ? void 0 : _a.background) || "rgba(250, 240, 202, 0.2)";
		this.overlay.style.borderColor = ((_b = options.style) === null || _b === void 0 ? void 0 : _b.borderColor) || "#F95738";
		this.overlay.style.borderStyle = ((_c = options.style) === null || _c === void 0 ? void 0 : _c.borderStyle) || "solid";
		this.overlay.style.borderRadius = ((_d = options.style) === null || _d === void 0 ? void 0 : _d.borderRadius) || "1px";
		this.overlay.style.borderWidth = ((_e = options.style) === null || _e === void 0 ? void 0 : _e.borderWidth) || "1px";
		this.overlay.style.boxSizing = ((_f = options.style) === null || _f === void 0 ? void 0 : _f.boxSizing) || "border-box";
		this.overlay.style.cursor = ((_g = options.style) === null || _g === void 0 ? void 0 : _g.cursor) || "crosshair";
		this.overlay.style.position = ((_h = options.style) === null || _h === void 0 ? void 0 : _h.position) || "absolute";
		this.overlay.style.zIndex = ((_j = options.style) === null || _j === void 0 ? void 0 : _j.zIndex) || "2147483647";
		this.overlay.style.margin = ((_k = options.style) === null || _k === void 0 ? void 0 : _k.margin) || "0px";
		this.overlay.style.padding = ((_l = options.style) === null || _l === void 0 ? void 0 : _l.padding) || "0px";
		this.shadowContainer = document.createElement("div");
		this.shadowContainer.className = "_ext-element-overlay-container";
		this.shadowContainer.style.position = "absolute";
		this.shadowContainer.style.top = "0px";
		this.shadowContainer.style.left = "0px";
		this.shadowContainer.style.margin = "0px";
		this.shadowContainer.style.padding = "0px";
		this.shadowRoot = this.shadowContainer.attachShadow({ mode: "open" });
	}
	addToDOM(parent, useShadowDOM) {
		this.usingShadowDOM = useShadowDOM;
		if (useShadowDOM) {
			parent.insertBefore(this.shadowContainer, parent.firstChild);
			this.shadowRoot.appendChild(this.overlay);
		}
		else {
			parent.appendChild(this.overlay);
		}
	}
	removeFromDOM() {
		this.setBounds({ x: 0, y: 0, width: 0, height: 0 });
		this.overlay.remove();
		if (this.usingShadowDOM) {
			this.shadowContainer.remove();
		}
	}
	captureCursor() {
		this.overlay.style.pointerEvents = "auto";
	}
	ignoreCursor() {
		this.overlay.style.pointerEvents = "none";
	}
	setBounds({ x, y, width, height }) {
		this.overlay.style.left = x + "px";
		this.overlay.style.top = y + "px";
		this.overlay.style.width = width + "px";
		this.overlay.style.height = height + "px";
	}
}

const getElementBounds = (el) => {
	const rect = el.getBoundingClientRect();
	return {
		x: window.pageXOffset + rect.left,
		y: window.pageYOffset + rect.top,
		width: el.offsetWidth,
		height: el.offsetHeight,
	};
};

const picker = new ElementPicker();
