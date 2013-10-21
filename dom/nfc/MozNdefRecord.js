/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright © 2013, Deutsche Telekom, Inc.
 */

"use strict";

const DEBUG = false;
function debug(s) {
  if (DEBUG) dump("-*- Nfc MozNdefRecord: " + s + "\n");
}

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function MozNdefRecord() {
  debug("XXXX In MozNdefRecord Constructor");
  this._nfcContentHelper = Cc["@mozilla.org/nfc/content-helper;1"]
                             .getService(Ci.nsINfcContentHelper);
}
MozNdefRecord.prototype = {
  _tnf: null,
  _type: null,
  _id: null,
  _payload: null,

  init: function init(aWindow) {
  },

  __init: function(tnf, type, id, payload) {
    this._tnf = tnf;
    this._type = type;
    this._id = id;
    this._payload = payload;
  },

  get tnf() {
    return this._tnf;
  },
  
  set tnf(v) {
    this._tnf = v;
  },
  
  get type() {
    return this._type;
  },
  
  set type(v) {
    this._type = v;
  },
  
  get id() {
    return this._id;
  },
  
  set id(v) {
    this._id = v;
  },
  
  get payload() {
    return this._payload;
  },
  
  set payload(v) {
    this._payload = v;
  },

  classID: Components.ID("{4E7DD439-D639-4DA9-8F8E-D019CAD9EAED}"),
  contractID: "@mozilla.org/nfc/NdefRecord;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports,
                                         Ci.nsIDOMGlobalPropertyInitializer]),
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([MozNdefRecord]);
