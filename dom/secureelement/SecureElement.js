/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* static functions */
const DEBUG = false;

function debug(aStr) {
  if (DEBUG)
    dump("SecureElementManager: " + aStr + "\n");
}

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/DOMRequestHelper.jsm");
Cu.import("resource://gre/modules/ObjectWrapper.jsm");

const SECUREELEMENTMANAGER_CONTRACTID = "@mozilla.org/secureelement;1";
const SECUREELEMENTMANAGER_CID        = Components.ID("{858e4113-0abd-4193-a2bd-1d146f1c6d9e}");
const nsIDOMSecureElementManager      = Ci.nsIDOMSecureElementManager;
const nsIClassInfo             = Ci.nsIClassInfo;

function SecureElementManager()
{
  debug("Constructor");
}

SecureElementManager.prototype = {

  __proto__: DOMRequestIpcHelper.prototype,

  classID : SECUREELEMENTMANAGER_CID,

  QueryInterface : XPCOMUtils.generateQI([nsIDOMSecureElementManager, Ci.nsIDOMGlobalPropertyInitializer]),

  classInfo : XPCOMUtils.generateCI({ classID: SECUREELEMENTMANAGER_CID,
                                      contractID: SECUREELEMENTMANAGER_CONTRACTID,
                                      classDescription: "SecureElementManager",
                                      interfaces: [nsIDOMSecureElementManager],
                                      flags: nsIClassInfo.DOM_OBJECT }),

  add: function add(aDate, aRespectTimezone, aData) {
    debug("add()");

    if (!this._manifestURL) {
      debug("Cannot add alarms for non-installed apps.");
      throw Components.results.NS_ERROR_FAILURE;
    }

  },

  remove: function remove(aId) {
    debug("remove()");

    return this._cpmm.sendSyncMessage(
      "SecureElementManager:Remove", 
      { id: aId, manifestURL: this._manifestURL }
    );
  },

  getAll: function getAll() {
    debug("getAll()");

    let request = this.createRequest();
    this._cpmm.sendAsyncMessage(
      "SecureElementManager:GetAll", 
      { requestId: this.getRequestId(request), manifestURL: this._manifestURL }
    );
    return request;
  },

  getSecureElementProvider: function getSecureElementProvider(type) {
    debug("getSecureElementProvider()");
  },
 

  receiveMessage: function receiveMessage(aMessage) {
    debug("receiveMessage(): " + aMessage.name);

    let json = aMessage.json;
    let request = this.getRequest(json.requestId);

    if (!request) {
      debug("No request stored! " + json.requestId);
      return;
    }

    switch (aMessage.name) {
      case "SecureElementManager:Add:Return:OK":
        break;

      case "SecureElementManager:GetAll:Return:OK":
        break;

      case "SecureElementManager:Add:Return:KO":
        break;

      case "SecureElementManager:GetAll:Return:KO":
        break;

      default:
        debug("Wrong message: " + aMessage.name);
        break;
    }
    this.removeRequest(json.requestId);
   },

  // nsIDOMGlobalPropertyInitializer implementation
  init: function init(aWindow) {
    debug("init()");

    // Set navigator.mozSecureElement to null.
    if (!Services.prefs.getBoolPref("dom.mozSecureElement.enabled"))
      //return null;

    // Only pages with perm set can use the alarms.
    let principal = aWindow.document.nodePrincipal;
    let perm = Services.perms.testExactPermissionFromPrincipal(principal, "alarms");
    if (perm != Ci.nsIPermissionManager.ALLOW_ACTION)
      return null;

    this._cpmm = Cc["@mozilla.org/childprocessmessagemanager;1"].getService(Ci.nsISyncMessageSender);

    // Add the valid messages to be listened.
    this.initHelper(aWindow, ["SecureElementManager:Add:Return:OK", "SecureElementManager:Add:Return:KO", 
                              "SecureElementManager:GetAll:Return:OK", "SecureElementManager:GetAll:Return:KO"]);

    // Get the manifest URL if this is an installed app
    let appsService = Cc["@mozilla.org/AppsService;1"]
                        .getService(Ci.nsIAppsService);
    this._pageURL = principal.URI.spec;
    this._manifestURL = appsService.getManifestURLByLocalId(principal.appId);
    this._window = aWindow;
  },

  // Called from DOMRequestIpcHelper.
  uninit: function uninit() {
    debug("uninit()");
  },
}

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([SecureElementManager])
