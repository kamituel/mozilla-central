/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Copyright © 2013, Deutsche Telekom, Inc. */

"use strict";

const DEBUG = false;
function debug(s) {
  if (DEBUG) dump("-*- Nfc DOM: " + s + "\n");
}

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/ObjectWrapper.jsm");

XPCOMUtils.defineLazyServiceGetter(this,
                                   "appsService",
                                   "@mozilla.org/AppsService;1",
                                   "nsIAppsService");

let gMozNfc = null;

const NFC_PEER_EVENT_FOUND = 1;
const NFC_PEER_EVENT_LOST  = 2;

/**
 * NFCTag
 */
function MozNFCTag() {
  debug("In MozNFCTag Constructor");
  this._nfcContentHelper = Cc["@mozilla.org/nfc/content-helper;1"]
                             .getService(Ci.nsINfcContentHelper);
  this.session = null;

  // Map WebIDL declared enum map names to integer
  this._techTypesMap = [];
  this._techTypesMap['NFC_A'] = 0;
  this._techTypesMap['NFC_B'] = 1;
  this._techTypesMap['NFC_ISO_DEP'] = 2;
  this._techTypesMap['NFC_F'] = 3;
  this._techTypesMap['NFC_V'] = 4;
  this._techTypesMap['NDEF'] = 5;
  this._techTypesMap['NDEF_FORMATABLE'] = 6;
  this._techTypesMap['MIFARE_CLASSIC'] = 7;
  this._techTypesMap['MIFARE_ULTRALIGHT'] = 8;
  this._techTypesMap['NFC_BARCODE'] = 9;
  this._techTypesMap['P2P'] = 10;
}
MozNFCTag.prototype = {
  _nfcContentHelper: null,
  _window: null,

  initialize: function(aWindow, aSessionToken) {
    this._window = aWindow;
    this.setSessionToken(aSessionToken);
  },

  // ChromeOnly interface
  setSessionToken: function setSessionToken(aSessionToken) {
    debug("Setting session token.");
    this.session = aSessionToken;
    // report to NFC worker:
    this._nfcContentHelper.setSessionToken(aSessionToken);
  },

  _techTypesMap: null,

  // NFCTag interface:
  getDetailsNDEF: function getDetailsNDEF() {
    return this._nfcContentHelper.getDetailsNDEF(this._window, this.session);
  },
  readNDEF: function readNDEF() {
    return this._nfcContentHelper.readNDEF(this._window, this.session);
  },
  writeNDEF: function writeNDEF(records) {
    return this._nfcContentHelper.writeNDEF(this._window, records, this.session);
  },
  makeReadOnlyNDEF: function makeReadOnlyNDEF() {
    return this._nfcContentHelper.makeReadOnlyNDEF(this._window, this.session);
  },
  connect: function connect(enum_tech_type) {
    let int_tech_type = this._techTypesMap[enum_tech_type];
    return this._nfcContentHelper.connect(this._window, int_tech_type, this.session);
  },
  close: function close() {
    return this._nfcContentHelper.close(this._window, this.session);
  },

  classID: Components.ID("{4e1e2e90-3137-11e3-aa6e-0800200c9a66}"),
  contractID: "@mozilla.org/nfc/NFCTag;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports,
                                         Ci.nsIDOMGlobalPropertyInitializer]),
};

/**
 * NFCPeer
 */
function MozNFCPeer() {
  debug("In MozNFCPeer Constructor");
  this._nfcContentHelper = Cc["@mozilla.org/nfc/content-helper;1"]
                             .getService(Ci.nsINfcContentHelper);
  this.session = null;
}
MozNFCPeer.prototype = {
  _nfcContentHelper: null,
  _window: null,

  initialize: function(aWindow, aSessionToken) {
    this._window = aWindow;
    this.session = aSessionToken;
  },

  // ChromeOnly interface
  setSessionToken: function setSessionToken(aSessionToken) {
    debug("Setting session token.");
    this.session = aSessionToken;
    // report to NFC worker:
    return this._nfcContentHelper.setSessionToken(aSessionToken);
  },

  // NFCPeer interface:
  sendNDEF: function sendNDEF(records) {
    // Just forward sendNDEF to writeNDEF
    return this._nfcContentHelper.writeNDEF(this._window, records, this.session);
  },

  sendFile: function sendFile(blob) {
    debug("sendFile is not currently implemented.");
    return null;
  },

  classID: Components.ID("{c1b2bcf0-35eb-11e3-aa6e-0800200c9a66}"),
  contractID: "@mozilla.org/nfc/NFCPeer;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports,
                                         Ci.nsIDOMGlobalPropertyInitializer]),
};

/**
 * Navigator NFC object
 */
function mozNfc() {
  debug("In mozNfc Constructor");
  this._nfcContentHelper = Cc["@mozilla.org/nfc/content-helper;1"]
                             .getService(Ci.nsINfcContentHelper);
  gMozNfc = this;
}
mozNfc.prototype = {
  _nfcContentHelper: null,
  _window: null,
  _wrap: function _wrap(obj) {
    return ObjectWrapper.wrap(obj, this._window);
  },

  init: function init(aWindow) {
    debug("mozNfc init called");
    this._window = aWindow;
    var self = this;
    this._cpmm = Cc["@mozilla.org/childprocessmessagemanager;1"]
                   .getService(Ci.nsISyncMessageSender);
    this._window.addEventListener("nfc-hardware-state-change", function (event) {
      self._cpmm.sendAsyncMessage("NFC:HardwareStateChange",
                                  { state: event.detail.nfcHardwareState });
    });
  },

  setPeerWindow: function setPeerWindow(manifestUrl) {
    // Get the AppID and pass it to ContentHelper
    let appID = appsService.getAppLocalIdByManifestURL(manifestUrl);
    this._nfcContentHelper.setPeerWindow(this._window, appID);
    return;
  },

  getNFCTag: function getNFCTag(sessionToken) {
    let obj = new MozNFCTag();
    let nfcTag = this._window.MozNFCTag._create(this._window, obj);
    if (nfcTag) {
      obj.initialize(this._window, sessionToken);
      return nfcTag;
    } else {
      debug("Error: Unable to create NFCTag");
      return null;
    }
  },

  getNFCPeer: function getNFCPeer(sessionToken) {
    let obj = new MozNFCPeer();
    let nfcPeer = this._window.MozNFCPeer._create(this._window, obj);
    if (nfcPeer) {
      obj.initialize(this._window, sessionToken);
      return nfcPeer;
    } else {
      debug("Error: Unable to create NFCPeer");
      return null;
    }
  },

  // get/set onpeerfound/lost
  get onpeerfound() {
    return this.__DOM_IMPL__.getEventHandler("onpeerfound");
  },

  set onpeerfound(handler) {
    this.__DOM_IMPL__.setEventHandler("onpeerfound", handler);
    let appId = this._window.document.nodePrincipal.appId;

    if (handler === null) {
      this._nfcContentHelper.unRegisterTargetForPeerEvent(this._window, appId,
                                                        NFC_PEER_EVENT_FOUND);
    } else {
      this._nfcContentHelper.registerTargetForPeerEvent(this._window, appId,
        NFC_PEER_EVENT_FOUND, function(evt, sessionToken) {
          this.session = sessionToken;
          gMozNfc.firePeerEvent(evt, sessionToken, handler);
      });
    }
  },

  get onpeerlost() {
    return this.__DOM_IMPL__.getEventHandler("onpeerlost");
  },

  set onpeerlost(handler) {
    this.__DOM_IMPL__.setEventHandler("onpeerlost", handler);
    let appId = this._window.document.nodePrincipal.appId;

    if (handler === null) {
      this._nfcContentHelper.unRegisterTargetForPeerEvent(this._window, appId,
                                                         NFC_PEER_EVENT_LOST);
    } else {
      this._nfcContentHelper.registerTargetForPeerEvent(this._window, appId,
        NFC_PEER_EVENT_LOST, function(evt, sessionToken) {
          this.session = sessionToken;
          gMozNfc.firePeerEvent(evt, sessionToken, handler);
      });
    }
  },

  firePeerEvent: function firePeerEvent(evt, sessionToken, handler) {
    let peerEvent = (NFC_PEER_EVENT_FOUND === evt) ? "peerfound" : "peerlost";
    let detail = {
      "detail":sessionToken
    };
    let event = new this._window.CustomEvent(peerEvent,
      ObjectWrapper.wrap(detail, this._window));
    this.__DOM_IMPL__.dispatchEvent(event);
  },

  classID: Components.ID("{6ff2b290-2573-11e3-8224-0800200c9a66}"),
  contractID: "@mozilla.org/navigatorNfc;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports,
                                         Ci.nsIDOMGlobalPropertyInitializer]),
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([MozNFCTag, MozNFCPeer, mozNfc]);
