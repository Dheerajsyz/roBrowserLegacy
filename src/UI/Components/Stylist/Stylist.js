/**
 * UI/Components/Stylist/Stylist.js
 *
 * Manage the Stylist (in-game appearance change) window.
 * Opened via ZC_UI_OPEN with ui_type=1.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import Preferences from 'Core/Preferences.js';
import UIComponent from 'UI/UIComponent.js';
import UIManager from 'UI/UIManager.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import htmlText from './Stylist.html?raw';
import cssText from './Stylist.css?raw';
import jQuery from 'Utils/jquery.js';

/**
 * Create Component
 */
var Stylist = new UIComponent('Stylist', htmlText, cssText);

/**
 * @var {Preferences} Window position
 */
var _preferences = Preferences.get('Stylist', {
	x: 300,
	y: 200,
}, 1.0);

/**
 * Current selection state
 */
var _curHairStyle   = 0;
var _curHairPalette = 0;
var _curBodyPalette = 0;
var _maxHairStyle   = 12; // 0-based, default human (13 styles)

/**
 * Initialize component
 */
Stylist.init = function init() {
	var ui = this.ui;

	// Draggable via titlebar
	this.draggable(ui.find('.titlebar'));

	// Close button
	ui.find('.btn-close').on('click', function () {
		Stylist.remove();
	});

	// Cancel button
	ui.find('.btn-cancel').on('click', function () {
		Stylist.remove();
	});

	// Confirm button
	ui.find('.btn-confirm').on('click', function () {
		Stylist.sendStyleChange();
	});

	// Hair style prev/next
	ui.find('.btn-hair-prev').on('click', function () {
		_curHairStyle = (_curHairStyle - 1 + _maxHairStyle + 1) % (_maxHairStyle + 1);
		Stylist.updateHairStyleDisplay();
	});

	ui.find('.btn-hair-next').on('click', function () {
		_curHairStyle = (_curHairStyle + 1) % (_maxHairStyle + 1);
		Stylist.updateHairStyleDisplay();
	});

	// Hair palette swatches
	ui.find('.hair-palette .pal-swatch').on('click', function () {
		_curHairPalette = parseInt(jQuery(this).data('pal'), 10);
		ui.find('.hair-palette .pal-swatch').removeClass('selected');
		jQuery(this).addClass('selected');
	});

	// Body palette swatches
	ui.find('.body-palette .pal-swatch').on('click', function () {
		_curBodyPalette = parseInt(jQuery(this).data('pal'), 10);
		ui.find('.body-palette .pal-swatch').removeClass('selected');
		jQuery(this).addClass('selected');
	});

	// Restore window position
	this.ui.css({
		top:  Math.min(Math.max(0, _preferences.y), window.innerHeight - 200),
		left: Math.min(Math.max(0, _preferences.x), window.innerWidth  - 200),
	});
};

/**
 * Called when the window is opened — load current values from the entity.
 */
Stylist.prepare = function prepare() {
	var entity = Session.Entity;
	if (!entity) {
		return;
	}

	var isDoram = DB.isDoram(entity.job);
	_maxHairStyle   = isDoram ? 6 : 12; // 0-based max (7 or 13 styles)
	_curHairStyle   = Math.max(0, entity._head   || 0);
	_curHairPalette = Math.max(0, entity._headpalette || 0);
	_curBodyPalette = Math.max(0, entity._bodypalette || 0);

	// Clamp to valid range
	_curHairStyle   = Math.min(_curHairStyle, _maxHairStyle);
	_curHairPalette = Math.min(_curHairPalette, 9);
	_curBodyPalette = Math.min(_curBodyPalette, 9);
};

/**
 * Called after append — sync display with current values.
 */
Stylist.onAppend = function onAppend() {
	this.updateHairStyleDisplay();
	this.updatePaletteDisplay();
};

/**
 * Update the hair style number display.
 */
Stylist.updateHairStyleDisplay = function updateHairStyleDisplay() {
	this.ui.find('.hair-style-value').text(_curHairStyle + 1); // show 1-based
};

/**
 * Mark the correct swatch as selected for hair & body palettes.
 */
Stylist.updatePaletteDisplay = function updatePaletteDisplay() {
	var ui = this.ui;

	ui.find('.hair-palette .pal-swatch').removeClass('selected');
	ui.find('.hair-palette .pal-swatch[data-pal="' + _curHairPalette + '"]').addClass('selected');

	ui.find('.body-palette .pal-swatch').removeClass('selected');
	ui.find('.body-palette .pal-swatch[data-pal="' + _curBodyPalette + '"]').addClass('selected');
};

/**
 * Send style change request to server.
 */
Stylist.sendStyleChange = function sendStyleChange() {
	var entity = Session.Entity;
	var pkt = new PACKET.CZ.REQ_STYLE_CHANGE();

	pkt.HeadStyle   = _curHairStyle;
	pkt.HeadPalette = _curHairPalette;
	pkt.BodyPalette = _curBodyPalette;
	// Keep current accessories unchanged
	pkt.TopAcc      = entity ? (entity._accessory3 || 0) : 0;
	pkt.MidAcc      = entity ? (entity._accessory2 || 0) : 0;
	pkt.BotAcc      = entity ? (entity._accessory  || 0) : 0;

	Network.sendPacket(pkt);
	Stylist.remove();
};

/**
 * Handle server response to style change.
 * @param {object} pkt - PACKET.ZC.STYLE_CHANGE_RES
 */
function onStyleChangeRes(pkt) {
	// flag = 0: success, non-zero: failure
	if (pkt.flag !== 0) {
		console.warn('[Stylist] Style change rejected by server (flag=' + pkt.flag + ')');
	}
}

/**
 * Server asks us to close the stylist window.
 */
function onCloseUI() {
	if (Stylist.ui && Stylist.ui.parent().length) {
		Stylist.remove();
	}
}

// Hook server → client packets
Network.hookPacket(PACKET.ZC.STYLE_CHANGE_RES,     onStyleChangeRes);
Network.hookPacket(PACKET.ZC.CLOSE_UI_STYLINGSHOP, onCloseUI);

/**
 * Create component and export it
 */
export default UIManager.addComponent(Stylist);
