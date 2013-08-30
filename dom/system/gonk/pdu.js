
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

var LECodec = Class.extend({
    construct: function(buffer) {
        buffer = typeof buffer !== 'undefined' ? buffer : new Uint8Array(8096);
        this.buffer = buffer;
        this.pos = 0;
    },

    align: function(mult) {
        var skip = (mult - this.pos % mult) % mult;
        this.pos += skip;
    },

    getOctet: function() {
        return this.buffer[this.pos++];
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
    
    getULong: function() {
        this.align(4);
        var b1 = this.getOctet();
        var b2 = this.getOctet();
        var b3 = this.getOctet();
        var b4 = this.getOctet();
        return b1 | (b2 << 8) | (b3 << 16) | (b4 << 24);
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

    getOctetArray: function() {
        var len = this.getULong();
        var a = new Uint8Array(len);
        var i = 0;
        for (i = 0; i < len; i++) {
            a[i] = this.getOctet();
        }
        return a;
    },

    putOctetArray: function(buf) {
        var len = buf.length;
        this.putULong(len)
        var i = 0;
        for (i = 0; i < len; i++) {
            this.putOctet(buf[i]);
        }
        return a;
    }
});

var NDEFRecord = Class.extend({
    construct: function() {
        this.tnf = 0;
        this.type = new Uint8Array(0);
        this.id = new Uint8Array(0);
        this.payload = new Uint8Array(0);
    },

    marshall: function(codec) {
        codec.putUShort(this.tnf);
        codec.putOctetArray(this.type);
        codec.putOctetArray(this.id);
        codec.putOctetArray(this.payload);
    }
});

NDEFRecord.unmarshall = function(codec) {
    var record = new NDEFRecord();
    record.tnf = codec.getUShort();
    record.type = codec.getOctetArray();
    record.id = codec.getOctetArray();
    record.payload = codec.getOctetArray();
    return record;
}


var NDEFMessage = Class.extend({
    construct: function() {
        this.records = new Array();
    },

    marshall: function(codec) {
        codec.putULong(this.records.length);
        var i = 0;
        for (i = 0; i < this.records.length; i++) {
            this.records[i].marshall(codec);
        }
    }
});

NDEFMessage.unmarshall = function(codec) {
    var msg = new NDEFMessage();
    var num = codec.getULong();
    var i = 0;
    for (i = 0; i < num; i++) {
        var record = NDEFRecord.unmarshall(codec);
        msg.records.push(record);
    }
    return msg;
}


var PDU = Class.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : -1;
        this.id = id;
    },

    getId: function() {
        return this.id;
    },

    marshall: function(codec) {
        codec.putULong(this.id);
    },

    unmarshall: function(codec) {
    }
});

PDU.IDS = {
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
    PDUInitializedNotification: 2000,
    PDUTechDiscoveredNotification: 2001,
    PDUTechLostNotification: 2002
}

PDU.parse = function(buffer) {
    var codec = new LECodec(buffer);
    var id = codec.getULong();
    var pdu;
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
        case PDU.IDS.PDUConfigResponse:
            pdu = new PDUConfigResponse();
            break;
        default:
            return undefined;
    }
    pdu.unmarshall(codec);
    return pdu;
}


var PDUNotification = PDU.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUNotification;
        this.$.construct.call(this, id);
        this.sessionId = 0;
    },
    
    unmarshall: function(codec) {
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
    construct: function() {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUResponse;
        this.$.construct.call(this, id);
        this.sessionId = 0;
        this.status = 0;
    },

    unmarshall: function(codec) {
        this.sessionId = codec.getULong();
        this.status = codec.getULong();
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
        this.tech = new Uint8Array(0);
    },
    
    unmarshall: function(codec) {
        this.$.unmarshall.call(this, codec);
        this.tech = codec.getOctetArray();
    }
});

var PDUTechLostNotification = PDUNotification.extend({
    construct: function(id) {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUTechLostNotification;
        this.$.construct.call(this, id);
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
        this.ndef = 0;
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
    },
    
    marshall: function(codec) {
        this.$.marshall.call(this, codec);
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
    construct: function() {
        id = typeof id !== 'undefined' ? id : PDU.IDS.PDUConfigResponse;
        this.$.construct.call(this, id);
        this.status = 0;
    },

    unmarshall: function(codec) {
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
a[i++] = 0xde;
a[i++] = 0xad;
a[i++] = 0xbe;
a[i++] = 0xef;
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
console.log(pdu);

var codec = new LECodec();
pdu.marshall(codec);

for (var i = 0; i < codec.pos; i++) {
    console.log(codec.buffer[i]);
}

*/