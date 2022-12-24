// ==UserScript==
// @name         Dark mode
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Invert color of the page
// @author       PioLeg
// @match        *://*/*
// @icon         https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fdownload%2Fblack%2Fsun-3-128.gif&f=1&nofb=1&ipt=45c4461b37bc7d3ffc99847e3ae5cd80f7c33a39e21fa42ac2becbda6b100d94&ipo=images
// @grant        GM_addStyle
// @run-at       document-start
// @downloadURL  https://github.com/pioleg/dark-mode/raw/master/dark-mode.user.js
// @updateURL    https://github.com/pioleg/dark-mode/raw/master/dark-mode.user.js
// ==/UserScript==



var style;

// Turn Dark mode on or off
function darkmode(on)
{
    if(on) {
        style = GM_addStyle(`
            html {
                filter: invert(100%) hue-rotate(180deg);
            }
            img, video, iframe {
                filter: invert(100%) hue-rotate(180deg);
            }
        `);
        console.log(style);
    } else {
        style.remove();
        style = null;
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
