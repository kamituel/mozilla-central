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

"use strict";


// http://joshgertzen.com/object-oriented-super-class-method-calling-with-javascript/

//Defines the top level Class
function Class() { }
Class.prototype.construct = function() {};
Class.__asMethod__ = function(func, superClass) {  
  return function() {
      var currentSuperClass = this.$;
      this.$ = superClass;
      var ret = func.apply(this, arguments);      
      this.$ = currentSuperClass;
      return ret;
  };
};
 
Class.extend = function(def) {
  var classDef = function() {
      if (arguments[0] !== Class) { this.construct.apply(this, arguments); }
  };
 
  var proto = new this(Class);
  var superClass = this.prototype;
 
  for (var n in def) {
      var item = def[n];                      
 
      if (item instanceof Function) {
          item = Class.__asMethod__(item, superClass);
      }
 
      proto[n] = item;
  }
 
  proto.$ = superClass;
  classDef.prototype = proto;
 
  //Give this new class the same static extend method    
  classDef.extend = this.extend;      
  return classDef;
};

/*-----------------------------------------------------------------------------*/

function b64tob(v) {
    var str = atob(v);
    var b = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        b[i] = str.charCodeAt(i);
    }
    return b;
}

function btob64(v) {
    var str = "";
    for (var i = 0; i < v.byteLength; i++) {
        str += String.fromCharCode(v[i]);
    }
    dump("Str : " + str);
    return btoa(str);
}

var LECodec = Class.extend({
    construct: function(buffer) {
        buffer = typeof buffer !== 'undefined' ? buffer : new Uint8Array(8096);
        this.buffer = buffer;
        this.pos = 0;
    },

    align: function(mult) {
        var skip = (mult - this.pos % mult) % mult;
        this.pos += skip;
        //dump("DBG: Align : skip - " + skip + " this.pos" +  this.pos + "mult" + mult );
    },

    getOctet: function() {
        var ret = this.buffer[this.pos++];
        //dump("getOctet : " + JSON.stringify(ret));
        return ret;
    },

    putOctet: function(val) {
        this.buffer[this.pos++] = val;
    },
    
    getBoolean: function() {
        return this.getOctet() == 0 ? false : true;
    },

    putBoolean: function(val) {
        this.putOctet(val ? 1 : 0);
    },
   
    getSize: function() {
        this.align(4);
        return this.getOctet() << 24 |
               this.getOctet() << 16 |
               this.getOctet() <<  8 |
               this.getOctet();
    },
 
    getULong: function() {
        //dump("getULong pos" + JSON.stringify(this.pos));
        this.align(4);
        dump("getULong pos:" + JSON.stringify(this.pos));
        var b1 = this.getOctet();
        //dump("getULong byte 1" + JSON.stringify(b1));
        var b2 = this.getOctet();
        //dump("getULong byte 2" + JSON.stringify(b2));
        var b3 = this.getOctet();
        //dump("getULong byte 3" + JSON.stringify(b3));
        var b4 = this.getOctet();
        //dump("getULong byte 4" + JSON.stringify(b4));
        var ret = b1 | (b2 << 8) | (b3 << 16) | (b4 << 24);
        dump("getULong " + ret);
        return ret;
    },

    putULong: function(val) {
        this.align(4);
        for (var i = 0; i < 4; i++) {
            var b = val & 0xff;
            this.putOctet(b);
            val = val >> 8;
        }
    },

    getUShort: function() {
        this.align(2);
        var b1 = this.getOctet();
        var b2 = this.getOctet();
        return b1 | (b2 << 8);
    },

    putUShort: function(val) {
        this.align(2);
        for (var i = 0; i < 2; i++) {
            var b = val & 0xff;
            this.putOctet(b);
            val = val >> 8;
        }
    },

    setPadding: function(len) {
      let padding = (len % 4) ? (4 - len % 4) : 0;
      dump("DBG:type padding = " + padding);
      for (let i = 0; i < padding; i++) {
        this.putOctet(0x00);
      }
    },

    getPadding: function(len) {
      let padding = (len % 4) ? (4 - len % 4) : 0;
      dump("DBG:type padding = " + padding);
      for (let i = 0; i < padding; i++) {
        this.getOctet();
      }
    },

    getOctetArray: function() {
        var len = this.getULong();
        var a = new Uint8Array(len);
        var i = 0;
        for (i = 0; i < len; i++) {
            a[i] = this.getOctet();
        }
        //this.getPadding(len);
        return a;
    },

    putOctetArray: function(buf) {
        var len = buf.length;
        this.putULong(len);
        dump("DBG: Length " + len);
        var i = 0;
        for (i = 0; i < len; i++) {
            this.putOctet(buf[i]);
        }
        this.setPadding(len);
        return;
    }
});

var NDEFMessage = {};

NDEFMessage.marshall = function(codec, ndefMsg) {
    codec.putULong(ndefMsg.length);
    for (var i = 0; i < ndefMsg.length; i++) {
        var ndefRec = ndefMsg[i];
        codec.putUShort(ndefRec.tnf);
        dump("DBG: ...");
        codec.putOctetArray(b64tob(ndefRec.type));
        codec.putOctetArray(b64tob(ndefRec.id));
        codec.putOctetArray(b64tob(ndefRec.payload));
    }
};

NDEFMessage.unmarshall = function(codec) {
    var msg = new Array();
    var num = codec.getULong();
    var i = 0;
    for (i = 0; i < num; i++) {
        var record = {};
        record.tnf = codec.getUShort();
        record.type = btob64(codec.getOctetArray());
        record.id = btob64(codec.getOctetArray());
        record.payload = btob64(codec.getOctetArray());
        msg.push(record);
    }
    return msg;
};


var PDU = Class.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : -1;
        this.id = id;
        this.size = 0;
    },

    getId: function() {
        return this.id;
    },

    getSize: function() {
        return this.size;
    },

    marshall: function(codec) {
        //codec.putULong(this.size);
        codec.putULong(this.id);
    },

    unmarshall: function(codec) {
    }
});

this.PDU.IDS = {
    PDUConfigRequest: 0,
    PDUConnectRequest: 1,
    PDUCloseRequest: 2,
    PDUNDEFDetailsRequest: 3,
    PDUNDEFReadRequest: 4,
    PDUNDEFWriteRequest: 5,
    PDUNDEFMakeReadOnlyRequest: 6,
    PDUResponse: 1000,
    PDUConfigResponse: 1001,
    PDUNDEFDetailsResponse: 1002,
    PDUNDEFReadResponse: 1003,
    PDUConnectResponse: 1004,
    PDUWriteResponse: 1005,
    PDUInitializedNotification: 2000,
    PDUTechDiscoveredNotification: 2001,
    PDUTechLostNotification: 2002
}

this.PDU.parse = function(buffer) {
    var codec = new LECodec(buffer);

    var size = codec.getSize();
    var id = codec.getULong();
    var pdu;
    dump("PDU PARSE: " + "id: " + id + "size: " + size);
    switch (id) {
        case PDU.IDS.PDUResponse:
            pdu = new PDUResponse();
            break;
        case PDU.IDS.PDUConfigResponse:
            pdu = new PDUConfigResponse();
            break;
        case PDU.IDS.PDUNDEFReadResponse:
            pdu = new PDUNDEFReadResponse();
            break;
        case PDU.IDS.PDUInitializedNotification:
            pdu = new PDUInitializedNotification();
            break;
        case PDU.IDS.PDUTechDiscoveredNotification:
            pdu = new PDUTechDiscoveredNotification();
            break;
        case PDU.IDS.PDUTechLostNotification:
            pdu = new PDUTechLostNotification();
            break;
        case PDU.IDS.PDUConnectResponse:
            pdu = new PDUConnectResponse();
            break;
        case PDU.IDS.PDUWriteResponse:
            pdu = new PDUWriteResponse();
            break;
        case PDU.IDS.PDUNDEFDetailsResponse:
            pdu = new PDUNDEFDetailsResponse();
            break;
        default:
            dump("DBG: - undefined id: " + id);
            return undefined;
    }
    pdu.unmarshall(codec);
    return pdu;
};

var PDUNotification = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNotification;
        this.$.construct.call(this, id);
        this.size = 0;
        this.sessionId = 0;
    },
    
    unmarshall: function(codec) {
        //this.size = codec.getSize();
        this.sessionId = codec.getULong();
    }
});


var PDURequest = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDURequest;
        this.$.construct.call(this, id);
        this.sessionId = 0;
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
        codec.putULong(this.sessionId);
    }
});

var PDUResponse = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUResponse;
        this.$.construct.call(this, id);
        this.sessionId = 0;
        this.status = 0;
    },

    unmarshall: function(codec) {
        this.status = codec.getULong();
        this.sessionId = codec.getULong();
        dump("Status " + this.status);
        dump("SessionId " + this.sessionId);
        //this.sessionId = codec.getULong();
    },

    getMessage: function() {
      var outMessage = {
        type: "NfcReqResponse",
        sessionId: this.sessionId,
        content: {
          status: "OK"
        }
      };
      debug("getMessage: " + JSON.stringify(outMessage));
      return outMessage;$
    },

    setSessionId: function(sessionId) {
        this.sessionId = sessionId;
    }
});

var PDUInitializedNotification = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUInitializedNotification;
        this.$.construct.call(this, id);
        this.status = 0;
        this.majorVersion = 0;
        this.minorVersion = 0;
    },
    
    unmarshall: function(codec) {
        this.$.unmarshall.call(this, codec);
        this.status = codec.getULong();
        this.majorVersion = codec.getULong();
        this.minorVersion = codec.getULong();
    }
});


var TECH = {
    TECH_NDEF: 0,
    TECH_NDEF_WRITABLE: 1,
    TECH_P2P: 2,
    TECH_NFCA: 3
};

var PDUTechDiscoveredNotification = PDUNotification.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUTechDiscoveredNotification;
        this.$.construct.call(this, id);
        this.techSize = 0;
        this.tech = new Uint8Array(0);
    },

    getMessage: function() {
      // TBD: Need to change NDEF hardcoding here
      var tech = ["NDEF","NFC_A"];
      var outMessage = {
        type: "techDiscovered",
        sessionId: this.sessionId,
        content: {
         tech: tech
        }
      };
      debug("getMessage: " + JSON.stringify(outMessage));
      return outMessage;
    },

    unmarshall: function(codec) {
        this.$.unmarshall.call(this, codec);
        this.techSize = codec.getULong();
        dump("techSize " + this.techSize);
        //this.tech = new Uint8Array(techSize);
        this.tech = codec.getOctetArray();
    }
});

var PDUTechLostNotification = PDUNotification.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUTechLostNotification;
        this.$.construct.call(this, id);
    },

    getMessage: function() {
      // TBD: Need to change NDEF hardcoding here
      var tech = ["NDEF"];
      var outMessage = {
        type: "techLost",
        sessionId: this.sessionId,
        content: {
          message: "NDEF"
        }
      };
      debug("getMessage: " + JSON.stringify(outMessage));
      return outMessage;
    },

    unmarshall: function(codec) {
        this.$.unmarshall.call(this, codec);
    }
});

var PDUConfigRequest = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUConfigRequest;
        this.$.construct.call(this, id);
        this.powerLevel = -1;
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
        codec.putULong(this.powerLevel);
    }
});

var PDUConfigResponse = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUConfigResponse;
        this.$.construct.call(this, id);
        this.status = 0;
    },
    
    unmarshall: function(codec) {
        this.$.unmarshall.call(this, codec);
        this.status = codec.getULong();
    }
});

var PDUConnectRequest = PDURequest.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUConnectRequest;
        this.$.construct.call(this, id);
        this.tech = -1;
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
        codec.putOctet(this.tech);
    }
});

var PDUCloseRequest = PDURequest.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUCloseRequest;
        this.$.construct.call(this, id);
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
    }
});

var PDUNDEFDetailsRequest = PDURequest.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNDEFDetailsRequest;
        this.$.construct.call(this, id);
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
    }
});

var PDUNDEFDetailsResponse = PDUResponse.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNDEFDetailsResponse;
        this.$.construct.call(this, id);
        this.isReadOnly = false;
        this.canBeMadeReadOnly = false;
        this.maxNdefLen = 0;
    },
    
    getMessage: function() {
      // TBD: Need to change status hardcoding here
      var outMessage = {
        type: "NDEFDetailsResponse",
        sessionId: this.sessionId,
        content: {
           maxndefMsgLen: this.maxNdefLen,
           canBeMadeReadonly: this.canBeMadeReadOnly,
           isReadOnly: this.isReadOnly
        }
      };
      debug("getMessage: " + JSON.stringify(outMessage));
      return outMessage;
    },

    unmarshall: function(codec) {
        this.$.unmarshall.call(this, codec);
        this.isReadOnly = codec.getBoolean();
        this.canBeMadeReadOnly = codec.getBoolean();
        this.maxNdefLen = codec.getULong();
    }
});

var PDUNDEFReadRequest = PDURequest.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNDEFReadRequest;
        this.$.construct.call(this, id);
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
    }
});

var PDUNDEFReadResponse = PDUResponse.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNDEFReadResponse;
        this.$.construct.call(this, id);
        this.ndef = [];
    },

    getMessage: function() {
      // TBD: Need to change status hardcoding here
      var outMessage = {
        type: "NDEFReadResponse",
        sessionId: this.sessionId,
        content: {
           records: this.ndef
        }
      };
      debug("getMessage: " + JSON.stringify(outMessage));
      return outMessage;
    },

    unmarshall: function(codec) {
        this.$.unmarshall.call(this, codec);
        this.ndef = NDEFMessage.unmarshall(codec);
    }
});

var PDUNDEFWriteRequest = PDURequest.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNDEFWriteRequest;
        this.$.construct.call(this, id);
        this.ndef = [];
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
        NDEFMessage.marshall(codec, this.ndef);
    }
});

var PDUNDEFMakeReadOnlyRequest = PDURequest.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNDEFMakeReadOnlyRequest;
        this.$.construct.call(this, id);
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
    }
});

var PDUConfigRequest = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUConfigRequest;
        this.$.construct.call(this, id);
        this.powerSave = -1;
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
        codec.putULong(this.powerSave);
    }
});

var PDUConfigResponse = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUConfigResponse;
        this.$.construct.call(this, id);
        this.status = 0;
    },

    unmarshall: function(codec) {
        this.status = codec.getULong();
    }
});

var PDUConnectResponse = PDUResponse.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUConnectResponse;
        this.$.construct.call(this, id);
        this.status = 0;
    },

    getMessage: function() {
      // TBD: Need to change status hardcoding here
      var outMessage = {
        type: "ConnectResponse",
        sessionId: this.sessionId,
        content: {
          status: "OK"
        }
      };
      debug("getMessage: " + JSON.stringify(outMessage));
      return outMessage;
    },

    unmarshall: function(codec) {
        this.sessionId = codec.getULong();
        this.status = codec.getULong();
    }
});



var PDUWriteResponse = PDUResponse.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUWriteResponse;
        this.$.construct.call(this, id);
        this.status = 0;
    },

    getMessage: function() {
      // TBD: Need to change status hardcoding here
      var outMessage = {
        type: "NDEFWriteResponse",
        sessionId: this.sessionId,
        content: {
          status: "OK"
        }
      };
      debug("getMessage: " + JSON.stringify(outMessage));
      return outMessage;
    },

    unmarshall: function(codec) {
        this.sessionId = codec.getULong();
        this.status = codec.getULong();
    }
});

/*-------------------------------------------------------------------------------*/

/*
// Unmarshalling example

var a = new Uint8Array(100);
var i = 0;

a[i++] = 0xeb; // Note: 0x03eb == 1003
a[i++] = 0x03;
a[i++] = 0;
a[i++] = 0;
a[i++] = 4;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0x1f;
a[i++] = 0x83;
a[i++] = 0xd8;
a[i++] = 0x63;
a[i++] = 1;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0x42;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 1;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 1;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 1;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 2;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 2;
a[i++] = 0;
a[i++] = 0;
a[i++] = 0;
a[i++] = 3;
a[i++] = 4;

var pdu = PDU.parse(a);
console.log(pdu.getId());
console.log(pdu.sessionId);
console.log(pdu.ndef);

// Marshalling example

console.log("------------------------------------------");

pdu = new PDUCloseRequest();
console.log(">>>>>>>>>>>>>> " + pdu.getId());

pdu.sessionId = 0x1234;

var codec = new LECodec();
pdu.marshall(codec);

for (var i = 0; i < codec.pos; i++) {
    console.log(codec.buffer[i]);
}

*/
