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

const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

let NFC = {};
Cu.import("resource://gre/modules/nfc_consts.js", NFC);

// set to true in nfc_consts.js to see debug messages
let DEBUG = NFC.DEBUG_NFC;

let debug;
if (DEBUG) {
  debug = function (s) {
    dump("-*- Nfc: " + s + "\n");
  };
} else {
  debug = function (s) {};
}

const NFC_CONTRACTID = "@mozilla.org/nfc;1";
const NFC_CID =
  Components.ID("{2ff24790-5e74-11e1-b86c-0800200c9a66}");

const NFC_IPC_MSG_NAMES = [
  "NFC:SetSessionToken",
  "NFC:ReadNDEF",
  "NFC:WriteNDEF",
  "NFC:GetDetailsNDEF",
  "NFC:MakeReadOnlyNDEF",
  "NFC:Connect",
  "NFC:Close",
  "NFC:HardwareStateChange"
];

const NFC_IPC_PEER_MSG_NAMES = [
  "NFC:RegisterPeerEvent",
  "NFC:UnregisterPeerEvent",
  "NFC:ValidateAppID",
  "NFC:NotifyP2PUserResponse"
];

XPCOMUtils.defineLazyServiceGetter(this, "ppmm",
                                   "@mozilla.org/parentprocessmessagemanager;1",
                                   "nsIMessageBroadcaster");
XPCOMUtils.defineLazyServiceGetter(this, "gSystemMessenger",
                                   "@mozilla.org/system-message-internal;1",
                                   "nsISystemMessagesInternal");
XPCOMUtils.defineLazyServiceGetter(this, "gSystemWorkerManager",
                                   "@mozilla.org/telephony/system-worker-manager;1",
                                   "nsISystemWorkerManager");
XPCOMUtils.defineLazyServiceGetter(this, "gSettingsService",
                                   "@mozilla.org/settingsService;1",
                                   "nsISettingsService");
XPCOMUtils.defineLazyServiceGetter(this, "UUIDGenerator",
                                    "@mozilla.org/uuid-generator;1",
                                    "nsIUUIDGenerator");
XPCOMUtils.defineLazyGetter(this, "gMessageManager", function () {
  return {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIMessageListener,
                                           Ci.nsIObserver]),

    nfc: null,

    // Manage message targets in terms of sessionToken. Only the authorized and
    // registered contents can receive related messages.
    targetsBySessionTokens: {},
    sessionTokens: [],

    // Registered Queue of PeerTargets
    peerTargetsQueue: [],

    init: function init(nfc) {
      this.nfc = nfc;

      Services.obs.addObserver(this, "xpcom-shutdown", false);
      this._registerMessageListeners();
    },

    _shutdown: function _shutdown() {
      this.nfc = null;

      Services.obs.removeObserver(this, "xpcom-shutdown");
      this._unregisterMessageListeners();
    },

    _registerMessageListeners: function _registerMessageListeners() {
      ppmm.addMessageListener("child-process-shutdown", this);
      for (let msgname of NFC_IPC_MSG_NAMES) {
        ppmm.addMessageListener(msgname, this);
      }

      for each (let msgname in NFC_IPC_PEER_MSG_NAMES) {
        ppmm.addMessageListener(msgname, this);
      }
    },

    _unregisterMessageListeners: function _unregisterMessageListeners() {
      ppmm.removeMessageListener("child-process-shutdown", this);
      for (let msgname of NFC_IPC_MSG_NAMES) {
        ppmm.removeMessageListener(msgname, this);
      }

      for each (let msgname in NFC_IPC_PEER_MSG_NAMES) {
        ppmm.removeMessageListener(msgname, this);
      }
      ppmm = null;
    },

    _registerMessageTarget: function _registerMessageTarget(sessionToken, target) {
      let targets = this.targetsBySessionTokens[sessionToken];
      if (!targets) {
        targets = this.targetsBySessionTokens[sessionToken] = [];
        let list = this.sessionTokens;
        if (list.indexOf(sessionToken) == -1) {
          list.push(sessionToken);
        }
      }

      if (targets.indexOf(target) != -1) {
        debug("Already registered this target!");
        return;
      }

      targets.push(target);
      debug("Registered :" + sessionToken + " target: " + target);
    },

    _unregisterMessageTarget: function _unregisterMessageTarget(sessionToken, target) {
      if (sessionToken == null) {
        // Unregister the target for every sessionToken when no sessionToken is specified.
        for (let session of this.sessionTokens) {
          this._unregisterMessageTarget(session, target);
        }
        return;
      }

      // Unregister the target for a specified sessionToken.
      let targets = this.targetsBySessionTokens[sessionToken];
      if (!targets) {
        return;
      }

      if (target == null) {
        debug("Unregistered all targets for the " + sessionToken + " targets: " + targets);
        targets = [];
        let list = this.sessionTokens;
        if (sessionToken !== null) {
          let index = list.indexOf(sessionToken);
          if (index > -1) {
            list.splice(index, 1);
          }
        }
        return;
      }

      let index = targets.indexOf(target);
      if (index != -1) {
        targets.splice(index, 1);
      }
    },

    _sendTargetMessage: function _sendTargetMessage(sessionToken, message, options) {
      let targets = this.targetsBySessionTokens[sessionToken];
      if (!targets) {
        return;
      }

      for (let target of targets) {
        target.sendAsyncMessage(message, options);
      }
    },

    _registerPeerTarget: function _registerPeerTarget(msg) {
      let appInfo = msg.json;
      let targets = this.peerTargetsQueue;

      for (let index = 0; index < targets.length; index++) {
        if (targets[index].appId === appInfo.appId) {
          /**
           * If the application Id matches and one of the events
           * (NFC_PEER_EVENT_READY / NFC_PEER_EVENT_LOST) is already registered
           */
          if (targets[index].event & appInfo.event) {
            // Already registered target for this event. Do Nothing!
            debug("Already registered this target and event ! AppID: " +
                             appInfo.appId + " Event: "+ appInfo.event);
          } else {
             // Otherwise, update the event field ONLY
             targets[index].event |= appInfo.event;
          }
          // No need to add to list of registered targets again, return!
          return;
        }
      }

      // Target not found! Add to the target queue

      /**
       * Registered PeerInfo target consists of 4 fields
       * target : Target to notify the right content for peer notifications
       * appId  : The Application that registered for the peerReady / peerlost events
       * event  : Possible values are : 0x01 , 0x02 OR 0x03
       *          NFC_PEER_EVENT_READY , NFC_PEER_EVENT_LOST OR
       *          (NFC_PEER_EVENT_READY | NFC_PEER_EVENT_LOST)
       * active : Flag indicating that 'this' target / Content
       *          is deemed to receive 'NFC_PEER_EVENT_READY' notification
       */
      let peerInfo = { target : msg.target,
                       appId  : appInfo.appId,
                       event  : appInfo.event,
                       active : false };
      targets.push(peerInfo);
    },

    _unregisterPeerTarget: function _unregisterPeerTarget(msg) {
      let appInfo = msg.json;
      let targets = this.peerTargetsQueue;
      let index = 0;
      let matchFound = false;

      for (; index < targets.length; index++) {
        if (targets[index].appId === appInfo.appId) {
          if (targets[index].event === appInfo.event) {
             /**
              * Both the application Id and the event exactly match.
              * Mark this 'index' and remove it from the list of registered targets
              */
             matchFound = true;
             break
          } else {
             // Otherwise, update the event field ONLY, by removing the event flag
             targets[index].event &= ~appInfo.event;
             // Since only 'event' field is updated, return...
             return;
          }
        }
      }
      if (matchFound) {
        targets.splice(index, 1);
      }
    },

    /**
     * nsIMessageListener interface methods.
     */

    receiveMessage: function receiveMessage(msg) {
      debug("Received '" + msg.name + "' message from content process");
      if (msg.name == "child-process-shutdown") {
        // By the time we receive child-process-shutdown, the child process has
        // already forgotten its permissions so we need to unregister the target
        // for every permission.
        this._unregisterMessageTarget(null, msg.target);
        return null;
      }

      if (NFC_IPC_MSG_NAMES.indexOf(msg.name) != -1) {
        if (!msg.target.assertPermission("nfc-read")) {
          debug("Nfc message " + msg.name +
                " from a content process with no 'nfc-read' privileges.");
          return null;
        }
      } else if (NFC_IPC_PEER_MSG_NAMES.indexOf(msg.name) != -1) {
        if (!msg.target.assertPermission("nfc-write")) {
          if (DEBUG) {
            debug("Nfc Peer message  " + msg.name +
                  " from a content process with no 'nfc-write' privileges.");
          }
          return null;
        }
      } else {
        debug("Ignoring unknown message type: " + msg.name);
        return null;
      }

      switch (msg.name) {
        case "NFC:SetSessionToken":
          this._registerMessageTarget(this.nfc.sessionTokenMap[this.nfc._currentSessionId], msg.target);
          debug("Registering target for this SessionToken : " +
                this.nfc.sessionTokenMap[this.nfc._currentSessionId]);
          break;
        case "NFC:RegisterPeerEvent":
          this._registerPeerTarget(msg);
          break;
        case "NFC:UnregisterPeerEvent":
          this._unregisterPeerTarget(msg);
          break;
        case "NFC:ValidateAppID":
          // ONLY privileged Content can send this event
          if (!msg.target.assertPermission("nfc-manager")) {
            debug("NFC message " + message.name +
                  " from a content process with no 'nfc-manager' privileges.");
            break;
          }
          /**
           * Check to see if the application id is a valid registered target. (It
           * should have registered for NFC_PEER_EVENT_READY).
           *
           * Notify the content process immediately of the status
           */
           var isRegistered = this.validateAppID(msg.json.appId);
           var status = (isRegistered === true) ? NFC.GECKO_NFC_ERROR_SUCCESS :
                                                  NFC.GECKO_NFC_ERROR_GENERIC_FAILURE;
           msg.target.sendAsyncMessage(msg.name + "Response", {status: status,
                                               requestId: msg.json.requestId});
           break;
        case "NFC:NotifyP2PUserResponse":
          // ONLY privileged Content can send this event
          if (!msg.target.assertPermission("nfc-manager")) {
            debug("NFC message " + message.name +
                  " from a content process with no 'nfc-manager' privileges.");
            break;
          }
          // Notify the 'NFC_PEER_EVENT_READY' in case, user has acknowledged
          if (msg.json.userResponse === true) {
            this.notifyPeerReady(msg.json.appID);
            break;
          }
          // Ignore:User has NOT acknowledged!
      }
      return null;
    },

    /**
     * nsIObserver interface methods.
     */

    observe: function observe(subject, topic, data) {
      switch (topic) {
        case "xpcom-shutdown":
          this._shutdown();
          break;
      }
    },

    sendNfcResponseMessage: function sendNfcResponseMessage(message, data) {
      this._sendTargetMessage(this.nfc.sessionTokenMap[this.nfc._currentSessionId], message, data);
    },

    validateAppID: function validateAppID(appId) {
      let targets = this.peerTargetsQueue;
      for (let index = 0; index < targets.length; index++) {
        /**
         * Check if it is a registered target and
         * capable of receiving NFC_PEER_EVENT_READY
         */
        if ((appId === targets[index].appId) &&
            (targets[index].event & NFC.NFC_PEER_EVENT_READY)) {
          return true;
        }
      }
      return false;
    },

    notifyPeerReady: function notifyPeerReady(appId) {
      let targets = this.peerTargetsQueue;
      for (let index = 0; index < targets.length; index++) {
        // Check if it is a registered target
        if (appId === targets[index].appId) {
          /**
           *  If YES, update the 'active' flag and notify the
           *  target of 'NFC_PEER_EVENT_READY' with the current session
           */
          targets[index].active = true;
          targets[index].target.sendAsyncMessage("NFC:PeerEvent", {event: NFC.NFC_PEER_EVENT_READY,
                              sessionToken: this.nfc.sessionTokenMap[this.nfc._currentSessionId]});
          return;
        }
      }
      debug("Application ID : " + appId + " is not a registered target for PeerReady notification");
    },

    notifyPeerLost: function notifyPeerLost() {
      let targets = this.peerTargetsQueue;
      for (let index = 0; index < targets.length; index++) {
        // Check for 'active' target that was notified of 'peerReady' event
        if (targets[index].active === true) {
          /**
           *  If YES, update the 'active' flag and notify the
           *  target of 'NFC_PEER_EVENT_LOST' with the current session
           */
          targets[index].active = false;
          targets[index].target.sendAsyncMessage("NFC:PeerEvent", {event: NFC.NFC_PEER_EVENT_LOST,
                             sessionToken: this.nfc.sessionTokenMap[this.nfc._currentSessionId]});
          return;
        }
      }
      debug("No active registered target for PeerLost notification");
    },
  };
});

function Nfc() {
  debug("Starting Worker");
  this.worker = new ChromeWorker("resource://gre/modules/nfc_worker.js");
  this.worker.onerror = this.onerror.bind(this);
  this.worker.onmessage = this.onmessage.bind(this);

  for each (let msgname in NFC_IPC_MSG_NAMES) {
    ppmm.addMessageListener(msgname, this);
  }

  Services.obs.addObserver(this, NFC.TOPIC_XPCOM_SHUTDOWN, false);

  gMessageManager.init(this);
  let lock = gSettingsService.createLock();
  lock.get(NFC.SETTING_NFC_ENABLED, this);
  // Maps sessionId (that are generated from nfcd) with a unique guid : 'SessionToken'
  this.sessionTokenMap = {};

  gSystemWorkerManager.registerNfcWorker(this.worker);
}

Nfc.prototype = {

  classID:   NFC_CID,
  classInfo: XPCOMUtils.generateCI({classID: NFC_CID,
                                    classDescription: "Nfc",
                                    interfaces: [Ci.nsIWorkerHolder]}),

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIWorkerHolder,
                                         Ci.nsIObserver,
                                         Ci.nsISettingsServiceCallback]),

  _currentSessionId: null,
  _enabled: false,

  onerror: function onerror(event) {
    debug("Got an error: " + event.filename + ":" +
          event.lineno + ": " + event.message + "\n");
    event.preventDefault();
  },

  /**
   * Send arbitrary message to worker.
   *
   * @param nfcMessageType
   *        A text message type.
   * @param message [optional]
   *        An optional message object to send.
   */
  sendToWorker: function sendToWorker(nfcMessageType, message) {
    message = message || {};
    message.type = nfcMessageType;
    this.worker.postMessage(message);
  },

  /**
   * Send Error response to content.
   *
   * @param message
   *        An nsIMessageListener's message parameter.
   */
  sendNfcErrorResponse: function sendNfcErrorResponse(message) {
    if (!message.target) {
      return;
    }

    let nfcMsgType = message.name + "Response";
    message.target.sendAsyncMessage(nfcMsgType, {
      sessionId: message.json.sessionToken,
      requestId: message.json.requestId,
      status: NFC.GECKO_NFC_ERROR_GENERIC_FAILURE
    });
  },

  /**
   * Process the incoming message from the NFC worker
   */
  onmessage: function onmessage(event) {
    let message = event.data;
    debug("Received message from NFC worker: " + JSON.stringify(message));

    switch (message.type) {
      case "techDiscovered":
        this._currentSessionId = message.sessionId;

        // Check if the session token already exists. If exists, continue to use the same one.
        // If not, generate a new token.
        if (!this.sessionTokenMap[this._currentSessionId]) {
          this.sessionTokenMap[this._currentSessionId] = UUIDGenerator.generateUUID().toString();
        }
        // Update the upper layers with a session token (alias)
        message.sessionToken = this.sessionTokenMap[this._currentSessionId];
        // Do not expose the actual session to the content
        delete message.sessionId;

        gSystemMessenger.broadcastMessage("nfc-manager-tech-discovered", message);
        break;
      case "techLost":
        gMessageManager._unregisterMessageTarget(this.sessionTokenMap[this._currentSessionId], null);

        // Update the upper layers with a session token (alias)
        message.sessionToken = this.sessionTokenMap[this._currentSessionId];
        // Do not expose the actual session to the content
        delete message.sessionId;

        gSystemMessenger.broadcastMessage("nfc-manager-tech-lost", message);
        // Notify 'PeerLost' to appropriate registered target, if any
        gMessageManager.notifyPeerLost();
        delete this.sessionTokenMap[this._currentSessionId];
        this._currentSessionId = null;
        break;
     case "ConfigResponse":
        gSystemMessenger.broadcastMessage("nfc-powerlevel-change", message);
        break;
      case "ConnectResponse": // Fall through.
      case "CloseResponse":
      case "GetDetailsNDEFResponse":
      case "ReadNDEFResponse":
      case "MakeReadOnlyNDEFResponse":
      case "WriteNDEFResponse":
        message.sessionToken = this.sessionTokenMap[this._currentSessionId];
        // Do not expose the actual session to the content
        delete message.sessionId;
        gMessageManager.sendNfcResponseMessage("NFC:" + message.type, message);
        break;
      default:
        throw new Error("Don't know about this message type: " + message.type);
    }
  },

  // nsINfcWorker
  worker: null,

  nfcHwState: NFC.NFC_HW_STATE_UNKNOWN,

  sessionTokenMap: null,

  /**
   * Process a message from the content process.
   */
  receiveMessage: function receiveMessage(message) {
    debug("Received '" + JSON.stringify(message) + "' message from content process");

    switch (message.name) {
      case "NFC:HardwareStateChange":
        if (!message.target.assertPermission("nfc-manager")) {
          debug("NFC message " + message.name +
                " from a content process with no 'nfc-manager' privileges.");
          return null;
        }
        let nfcHwState = message.json.state;
        if (nfcHwState === NFC.NFC_HW_STATE_ENABLED) {
          this._enabled = true;
        } else if (nfcHwState === NFC.NFC_HW_STATE_ENABLED) {
          this._enabled = false;
        }

        // Only if the value changes, set the power config and persist
        if (nfcHwState !== this.nfcHwState && this._enabled) {
          debug("New NFC Hardware State " + nfcHwState);
          this.setConfig({nfcHwState: nfcHwState});
          this.nfcHwState = nfcHwState;
        }
        return;
    }

    if (!this._enabled) {
      debug("NFC is not enabled.");
      this.sendNfcErrorResponse(message);
      return null;
    }

    // Enforce bare minimums for NFC permissions
    switch (message.name) {
      case "NFC:Connect": // Fall through
      case "NFC:Close":
      case "NFC:GetDetailsNDEF":
      case "NFC:ReadNDEF":
        if (!message.target.assertPermission("nfc-read")) {
          debug("NFC message " + message.name +
                " from a content process with no 'nfc-read' privileges.");
          this.sendNfcErrorResponse(message);
          return null;
        }
        break;
      case "NFC:WriteNDEF": // Fall through
      case "NFC:MakeReadOnlyNDEF":
        if (!message.target.assertPermission("nfc-write")) {
          debug("NFC message " + message.name +
                " from a content process with no 'nfc-write' privileges.");
          this.sendNfcErrorResponse(message);
          return null;
        }
        break;
      case "NFC:SetSessionToken":
        //Do nothing here. No need to process this message further
        return null;
    }

    // Sanity check on sessionId
    if (message.json.sessionToken !== this.sessionTokenMap[this._currentSessionId]) {
      debug("Invalid Session Token: " + message.json.sessionToken +
            " Expected Session Token: " + this.sessionTokenMap[this._currentSessionId]);
      this.sendNfcErrorResponse(message);
      return null;
    }

    // Update the current sessionId before sending to the worker
    message.sessionId = this._currentSessionId;

    switch (message.name) {
      case "NFC:GetDetailsNDEF":
        this.sendToWorker("getDetailsNDEF", message.json);
        break;
      case "NFC:ReadNDEF":
        this.sendToWorker("readNDEF", message.json);
        break;
      case "NFC:WriteNDEF":
        this.sendToWorker("writeNDEF", message.json);
        break;
      case "NFC:MakeReadOnlyNDEF":
        this.sendToWorker("makeReadOnlyNDEF", message.json);
        break;
      case "NFC:Connect":
        this.sendToWorker("connect", message.json);
        break;
      case "NFC:Close":
        this.sendToWorker("close", message.json);
        break;
      default:
        debug("UnSupported : Message Name " + message.name);
        return null;
    }
  },

  /**
   * nsISettingsServiceCallback
   */

  handle: function handle(aName, aResult) {
    switch(aName) {
      case NFC.SETTING_NFC_ENABLED:
        debug("'nfc.enabled' is now " + aResult);
        this._enabled = aResult;
        // General h/w setting
        let nfcHwState = this._enabled ? NFC.NFC_HW_STATE_ENABLED :
                                         NFC.NFC_HW_STATE_DISABLED;
        // Only if the value changes, set the new H/W state
        if (nfcHwState !== this.nfcHwState && this._enabled) {
          debug("New Hardware state: " + nfcHwState);
          this.setConfig({nfcHwState: nfcHwState});
          this.nfcHwState = nfcHwState;
        }
        break;
    }
  },

  /**
   * nsIObserver
   */

  observe: function observe(subject, topic, data) {
    switch (topic) {
      case NFC.TOPIC_XPCOM_SHUTDOWN:
        for each (let msgname in NFC_IPC_MSG_NAMES) {
          ppmm.removeMessageListener(msgname, this);
        }
        ppmm = null;
        Services.obs.removeObserver(this, NFC.TOPIC_XPCOM_SHUTDOWN);
        break;
    }
  },

  setConfig: function setConfig(prop) {
    this.sendToWorker("config", prop);
  }
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([Nfc]);
