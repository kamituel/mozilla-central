/* Copyright 2012 Mozilla Foundation and Mozilla contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Copyright © 2013, Deutsche Telekom, Inc. */

"use strict";

importScripts("systemlibs.js",  "ril_consts.js", "pdu.js");

// We leave this as 'undefined' instead of setting it to 'false'. That
// way an outer scope can define it to 'true' (e.g. for testing purposes)
// without us overriding that here.
let DEBUG = true;

let incomingBuffer = {};
let incomingBytes = new Uint8Array(1024);
let incomingReadIndex = 0;


//const PARCEL_SIZE_SIZE = UINT32_SIZE;

/**
 * Global stuff.
 */


if (!this.debug) {
  // Debugging stub that goes nowhere.
  this.debug = function debug(message) {
    dump("Nfc Worker: " + message + "\n");
  };
}
/**
 * Provide a high-level API representing NFC capabilities. This is
 * where JSON is sent and received from and translated into API calls.
 * For the most part, this object is pretty boring as it simply translates
 * between method calls and NFC JSON. Somebody's gotta do the job...
 */
let Nfc = {

  /**
   * Process incoming data.
   *
   * @param incoming
   *        nfc JSON message
   */
  processIncoming: function processIncoming(incoming) {
    if (DEBUG) dump("!!!Received message: processIncoming");
    dump("DBG - STEP 0");
    var pdu = PDU.parse(incoming);
    if (typeof pdu === 'undefined') {
       dump("WARNING! Undefined / Unsupported PDU");
       return;
    }
    dump("DBG - STEP 1");
    for (let i = 0; i < incoming.byteLength; i++) {
      incomingBytes[i] = 0;
    }
    incomingReadIndex = 0;
    dump("DBG - STEP 2");
    dump("ID: " + pdu.getId());
    dump("Size " + pdu.getSize());
    dump("SessionID " + pdu.sessionId);
    dump("Message " + JSON.stringify(pdu.getMessage()));

   this.sendDOMMessage(pdu.getMessage());
  },


  /**
   * Handle incoming messages from the main UI thread.
   *
   * @param message
   *        Object containing the message. Messages are supposed
   */
  handleDOMMessage: function handleMessage(message) {
    if (DEBUG) debug("Received DOM message " + JSON.stringify(message));
    let method = this[message.type];
    if (typeof method != "function") {
      if (DEBUG) {
        debug("Don't know what to do with message " + JSON.stringify(message));
      }
      return;
    }
    method.call(this, message);
  },

  /**
   * Retrieve metadata describing the NDEF formatted data, if present.
   */
  ndefDetails: function ndefDetails(message) {
    var pdu = new PDUNDEFDetailsRequest();
    pdu.sessionId = message.content.sessionId;

    var codec = new LECodec();
    pdu.marshall(codec);

    let buffer = new ArrayBuffer(codec.pos + 4);
    let bytes = new Uint8Array(buffer);

    for (var i = 0; i < codec.pos; i++) {
      bytes[i+4] = codec.buffer[i];
      dump(""+codec.buffer[i]);
    }
    dump("NDEF Details: Length of bytes being wrtten " + codec.pos);
    bytes[0] =  ((codec.pos >> 24) & 0xff);
    bytes[1] =  ((codec.pos >> 16) & 0xff);
    bytes[2] =  ((codec.pos >> 8) & 0xff);
    bytes[3] =  (codec.pos & 0xff);
    postNfcMessage(bytes);

  },

  /**
   * Read and return NDEF data, if present.
   */
  ndefRead: function ndefRead(message) {
    var pdu = new PDUNDEFReadRequest();
    pdu.sessionId = message.content.sessionId;

    var codec = new LECodec();
    pdu.marshall(codec);

    let buffer = new ArrayBuffer(codec.pos + 4);
    let bytes = new Uint8Array(buffer);

    for (var i = 0; i < codec.pos; i++) {
      bytes[i+4] = codec.buffer[i];
      dump(""+codec.buffer[i]);
    }
    dump("NDEF READ: Length of bytes being wrtten " + codec.pos);
    bytes[0] =  ((codec.pos >> 24) & 0xff);
    bytes[1] =  ((codec.pos >> 16) & 0xff);
    bytes[2] =  ((codec.pos >> 8) & 0xff);
    bytes[3] =  (codec.pos & 0xff);
    postNfcMessage(bytes);
  },

  /**
   * Write to a target that accepts NDEF formattable data
   */
  ndefWrite: function ndefWrite(message) {
    var pdu = new PDUNDEFWriteRequest();
    pdu.sessionId = message.content.sessionId;
    //this.NDEFMessage.marshall(codec, message.content.records);
    pdu.ndef = message.content.content.records.slice();

    var codec = new LECodec();
    pdu.marshall(codec);

    let buffer = new ArrayBuffer(codec.pos + 4);
    let bytes = new Uint8Array(buffer);

    for (var i = 0; i < codec.pos; i++) {
      bytes[i + 4] = codec.buffer[i];
      dump(""+codec.buffer[i]);
    }
    dump("NDEF WRITE: Length of bytes being wrtten " + codec.pos);
    bytes[0] =  ((codec.pos >> 24) & 0xff);
    bytes[1] =  ((codec.pos >> 16) & 0xff);
    bytes[2] =  ((codec.pos >> 8) & 0xff);
    bytes[3] =  (codec.pos & 0xff);
    postNfcMessage(bytes);
  },

  /**
   * Make the NFC NDEF tag permenantly read only
   */
  ndefMakeReadOnly: function ndefMakeReadOnly(message) {
    postNfcMessage(JSON.stringify(message.content));
  },

  /**
   * P2P NDEF message push between a pair of NFC devices.
   */
  ndefPush: function ndefPush(message) {
    postNfcMessage(JSON.stringify(message.content));
  },

  /**
   * Retrieve metadata describing the NfcA tag type, if present.
   */
  nfcATagDetails: function nfcATagDetails(message) {
    postNfcMessage(JSON.stringify(message.requestId)); // Just request ID.
  },

  /**
   *  Excahnge PDUs with the NFC target. Request ID is required.
   */
  nfcATagTransceive: function nfcATagTransceive(message) {
    postNfcMessage(JSON.stringify(message.content));
  },

  /**
   * Open a connection to the NFC target. Request ID is required.
   */
  connect: function connect(message) {
    var pdu = new PDUConnectRequest();
    pdu.sessionId = message.content.sessionId;
    pdu.tech = message.content.techType;

    var codec = new LECodec();
    pdu.marshall(codec);

    let buffer = new ArrayBuffer(codec.pos + 4);
    let bytes = new Uint8Array(buffer);

    for (var i = 0; i < codec.pos; i++) {
      bytes[i + 4] = codec.buffer[i];
      dump(""+codec.buffer[i]);
    }
    dump("Connect: Length of bytes being wrtten " + codec.pos);
    bytes[0] =  ((codec.pos >> 24) & 0xff);
    bytes[1] =  ((codec.pos >> 16) & 0xff);
    bytes[2] =  ((codec.pos >> 8) & 0xff);
    bytes[3] =  (codec.pos & 0xff);

    postNfcMessage(bytes);
  },

  /**
   * NFC Configuration
   */
  configRequest: function configRequest(message) {
    var pdu = new PDUConfigRequest();
    pdu.powerlevel = message.content.powerlevel;

    var codec = new LECodec();
    pdu.marshall(codec);

    let buffer = new ArrayBuffer(codec.pos + 4);
    let bytes = new Uint8Array(buffer);

    for (var i = 0; i < codec.pos; i++) {
      bytes[i + 4] = codec.buffer[i];
      dump(""+codec.buffer[i]);
    }
    dump("Connect: Length of bytes being wrtten " + codec.pos);
    bytes[0] =  ((codec.pos >> 24) & 0xff);
    bytes[1] =  ((codec.pos >> 16) & 0xff);
    bytes[2] =  ((codec.pos >> 8) & 0xff);
    bytes[3] =  (codec.pos & 0xff);

    postNfcMessage(bytes);
  },

  /**
   * Close connection to the NFC target. Request ID is required.
   */
  close: function close(message) {

    var pdu = new PDUCloseRequest();
    pdu.sessionId = message.content.sessionId;

    var codec = new LECodec();
    pdu.marshall(codec);

    let buffer = new ArrayBuffer(codec.pos + 4);
    let bytes = new Uint8Array(buffer);

    for (var i = 0; i < codec.pos; i++) {
      bytes[i + 4] = codec.buffer[i];
      dump(""+codec.buffer[i]);
    }
    dump("Connect: Length of bytes being wrtten " + codec.pos);
    bytes[0] =  ((codec.pos >> 24) & 0xff);
    bytes[1] =  ((codec.pos >> 16) & 0xff)
    bytes[2] =  ((codec.pos >> 8) & 0xff)
    bytes[3] =  (codec.pos & 0xff)

    postNfcMessage(bytes);
  },

  /**
   * Send messages to the main UI thread.
   */
  sendDOMMessage: function sendDOMMessage(message) {
    postMessage(message);
  }

};

/**
 * Process incoming data.
 *
 * @param data`
 *        Uint8Array containing the incoming data.
 */

function onNfcMessage(data) {
  dump("Length of bytes received " + data.byteLength);
  var length = data[0] << 24 | data[1] << 16 | data[2] << 8 | data[3];
  dump("Length value rcvd " + length);

  if (data.byteLength == 4) {
    incomingBytes.set(data, incomingReadIndex);
    incomingReadIndex+=4;
    dump("XXXX: Not enough size to read one full NFC message. ");
    return;
  }

  incomingBytes.set(data, incomingReadIndex);
  incomingReadIndex+=data.byteLength;
  Nfc.processIncoming(Array.slice(incomingBytes));
}

/*
function onNfcMessage(data) {
  dump("Length of bytes received " + data.byteLength);
  //let incomingBytes = new Uint8Array(data.byteLength);
  if (data.byteLength == 4) {
    var length = data[0] << 24 | data[1] << 16 | data[2] << 8 | data[3];   
    dump("Length value rcvd " + length);
    //return;
  }
  let incomingBytes = new Uint8Array(data.byteLength);
  incomingBytes.set(data, 0);
  Nfc.processIncoming(incomingBytes);
}*/

onmessage = function onmessage(event) {
  Nfc.handleDOMMessage(event.data);
};

onerror = function onerror(event) {
  debug("OnError: event: " + JSON.stringify(event));
  debug("NFC Worker error " + event.message + "\n");
};

