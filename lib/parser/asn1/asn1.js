// ASN.1 JavaScript decoder
// Copyright (c) 2008-2022 Lapo Luchini <lapo@lapo.it>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

(typeof define != "undefined" ? define : function(factory) {
  "use strict";
  if (typeof module == "object") {
    module.exports = factory(function(name) {
      return require(name);
    });
  } else {
    window.asn1 = factory(function(name) {
      return window[name.substring(2)];
    });
  }
})(function(require) {
  "use strict";

  const Int10 = require("./int10");
  const Stream = require("./stream");

  function ASN1(stream, header, length, tag, tagLen, sub) {
    if (!(tag instanceof ASN1Tag)) throw "Invalid tag value.";
    this.stream = stream;
    this.header = header;
    this.length = length;
    this.tag = tag;
    this.tagLen = tagLen;
    this.sub = sub;
  }

  ASN1.prototype.typeName = function() {
    switch (this.tag.tagClass) {
      case 0: // universal
        switch (this.tag.tagNumber) {
          case 0x00: return "EOC";
          case 0x01: return "BOOLEAN";
          case 0x02: return "INTEGER";
          case 0x03: return "BIT_STRING";
          case 0x04: return "OCTET_STRING";
          case 0x05: return "NULL";
          case 0x06: return "OBJECT_IDENTIFIER";
          case 0x07: return "ObjectDescriptor";
          case 0x08: return "EXTERNAL";
          case 0x09: return "REAL";
          case 0x0A: return "ENUMERATED";
          case 0x0B: return "EMBEDDED_PDV";
          case 0x0C: return "UTF8String";
          case 0x10: return "SEQUENCE";
          case 0x11: return "SET";
          case 0x12: return "NumericString";
          case 0x13: return "PrintableString"; // ASCII subset
          case 0x14: return "TeletexString"; // aka T61String
          case 0x15: return "VideotexString";
          case 0x16: return "IA5String"; // ASCII
          case 0x17: return "UTCTime";
          case 0x18: return "GeneralizedTime";
          case 0x19: return "GraphicString";
          case 0x1A: return "VisibleString"; // ASCII subset
          case 0x1B: return "GeneralString";
          case 0x1C: return "UniversalString";
          case 0x1E: return "BMPString";
        }
        return "Universal_" + this.tag.tagNumber.toString();
      case 1: return "Application_" + this.tag.tagNumber.toString();
      case 2: return "[" + this.tag.tagNumber.toString() + "]"; // Context
      case 3: return "Private_" + this.tag.tagNumber.toString();
    }
  };
  function recurse(el, parser, maxLength) {
    let avoidRecurse = true;
    if (el.tag.tagConstructed && el.sub) {
      avoidRecurse = false;
      el.sub.forEach(function(e1) {
        if (e1.tag.tagClass != el.tag.tagClass || e1.tag.tagNumber != el.tag.tagNumber) {
          avoidRecurse = true;
        }
      });
    }
    if (avoidRecurse) {
      return el.stream[parser](el.posContent(), el.posContent() + Math.abs(el.length), maxLength);
    }
    const d = {size: 0, str: ""};
    el.sub.forEach(function(el) {
      const d1 = recurse(el, parser, maxLength - d.str.length);
      d.size += d1.size;
      d.str += d1.str;
    });
    return d;
  }
  /** A string preview of the content (intended for humans). */
  ASN1.prototype.content = function(maxLength) {
    if (this.tag === undefined) {
      return null;
    }
    if (maxLength === undefined) {
      maxLength = Infinity;
    }
    const content = this.posContent();
    const len = Math.abs(this.length);
    if (!this.tag.isUniversal()) {
      if (this.sub !== null) {
        return "(" + this.sub.length + " elem)";
      }
      const d1 = this.stream.parseOctetString(content, content + len, maxLength);
      return "(" + d1.size + " byte)\n" + d1.str;
    }
    switch (this.tag.tagNumber) {
      case 0x01: // BOOLEAN
        return (this.stream.get(content) === 0) ? "false" : "true";
      case 0x02: // INTEGER
        return this.stream.parseInteger(content, content + len);
      case 0x03: // BIT_STRING
        var d = recurse(this, "parseBitString", maxLength);
        return "(" + d.size + " bit)\n" + d.str;
      case 0x04: // OCTET_STRING
        d = recurse(this, "parseOctetString", maxLength);
        return "(" + d.size + " byte)\n" + d.str;
        // case 0x05: // NULL
      case 0x06: // OBJECT_IDENTIFIER
        return this.stream.parseOID(content, content + len, maxLength);
        // case 0x07: // ObjectDescriptor
        // case 0x08: // EXTERNAL
        // case 0x09: // REAL
      case 0x0A: // ENUMERATED
        return this.stream.parseInteger(content, content + len);
        // case 0x0B: // EMBEDDED_PDV
      case 0x10: // SEQUENCE
      case 0x11: // SET
        if (this.sub !== null) {
          return "(" + this.sub.length + " elem)";
        } else {
          return "(no elem)";
        }
      case 0x0C: // UTF8String
        return recurse(this, "parseStringUTF", maxLength).str;
      case 0x14: // TeletexString
        return recurse(this, "parseStringT61", maxLength).str;
      case 0x12: // NumericString
      case 0x13: // PrintableString
      case 0x15: // VideotexString
      case 0x16: // IA5String
      case 0x1A: // VisibleString
      case 0x1B: // GeneralString
        // case 0x19: // GraphicString
        // case 0x1C: // UniversalString
        return recurse(this, "parseStringISO", maxLength).str;
      case 0x1E: // BMPString
        return recurse(this, "parseStringBMP", maxLength).str;
      case 0x17: // UTCTime
      case 0x18: // GeneralizedTime
        return this.stream.parseTime(content, content + len, (this.tag.tagNumber == 0x17));
    }
    return null;
  };
  ASN1.prototype.toString = function() {
    return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + ((this.sub === null) ? "null" : this.sub.length) + "]";
  };
  ASN1.prototype.toPrettyString = function(indent) {
    if (indent === undefined) indent = "";
    let s = indent + this.typeName() + " @" + this.stream.pos;
    if (this.length >= 0) {
      s += "+";
    }
    s += this.length;
    if (this.tag.tagConstructed) {
      s += " (constructed)";
    } else if ((this.tag.isUniversal() && ((this.tag.tagNumber == 0x03) || (this.tag.tagNumber == 0x04))) && (this.sub !== null)) {
      s += " (encapsulates)";
    }
    const content = this.content();
    if (content) {
      s += ": " + content.replace(/\n/g, "|");
    }
    s += "\n";
    if (this.sub !== null) {
      indent += "  ";
      for (let i = 0, max = this.sub.length; i < max; ++i) {
        s += this.sub[i].toPrettyString(indent);
      }
    }
    return s;
  };
  ASN1.prototype.posStart = function() {
    return this.stream.pos;
  };
  ASN1.prototype.posContent = function() {
    return this.stream.pos + this.header;
  };
  ASN1.prototype.posEnd = function() {
    return this.stream.pos + this.header + Math.abs(this.length);
  };
  /** Position of the length. */
  ASN1.prototype.posLen = function() {
    return this.stream.pos + this.tagLen;
  };
  ASN1.prototype.toHexString = function() {
    return this.stream.hexDump(this.posStart(), this.posEnd(), true);
  };
  ASN1.prototype.toB64String = function() {
    return this.stream.b64Dump(this.posStart(), this.posEnd());
  };
  ASN1.decodeLength = function(stream) {
    let buf = stream.get();
    const len = buf & 0x7F;
    if (len == buf) // first bit was 0, short form
    {
      return len;
    }
    if (len === 0) // long form with length 0 is a special case
    {
      return null;
    } // undefined length
    if (len > 6) // no reason to use Int10, as it would be a huge buffer anyways
    {
      throw "Length over 48 bits not supported at position " + (stream.pos - 1);
    }
    buf = 0;
    for (let i = 0; i < len; ++i) {
      buf = (buf * 256) + stream.get();
    }
    return buf;
  };
  function ASN1Tag(stream) {
    let buf = stream.get();
    this.tagClass = buf >> 6;
    this.tagConstructed = ((buf & 0x20) !== 0);
    this.tagNumber = buf & 0x1F;
    if (this.tagNumber == 0x1F) { // long tag
      const n = new Int10();
      do {
        buf = stream.get();
        n.mulAdd(128, buf & 0x7F);
      } while (buf & 0x80);
      this.tagNumber = n.simplify();
    }
  }
  ASN1Tag.prototype.isUniversal = function() {
    return this.tagClass === 0x00;
  };
  ASN1Tag.prototype.isEOC = function() {
    return this.tagClass === 0x00 && this.tagNumber === 0x00;
  };
  ASN1.decode = function(stream, offset) {
    if (!(stream instanceof Stream)) {
      stream = new Stream(stream, offset || 0);
    }
    const streamStart = new Stream(stream);
    const tag = new ASN1Tag(stream);
    const tagLen = stream.pos - streamStart.pos;
    let len = ASN1.decodeLength(stream);
    const start = stream.pos;
    const header = start - streamStart.pos;
    let sub = null;
    const getSub = function() {
      sub = [];
      if (len !== null) {
        // definite length
        const end = start + len;
        if (end > stream.enc.length) {
          throw "Container at offset " + start + " has a length of " + len + ", which is past the end of the stream";
        }
        while (stream.pos < end) {
          sub[sub.length] = ASN1.decode(stream);
        }
        if (stream.pos != end) {
          throw "Content size is not correct for container at offset " + start;
        }
      } else {
        // undefined length
        try {
          for (;;) {
            const s = ASN1.decode(stream);
            if (s.tag.isEOC()) {
              break;
            }
            sub[sub.length] = s;
          }
          len = start - stream.pos; // undefined lengths are represented as negative values
        } catch (e) {
          throw "Exception while decoding undefined length content at offset " + start + ": " + e;
        }
      }
    };
    if (tag.tagConstructed) {
      // must have valid content
      getSub();
    } else if (tag.isUniversal() && ((tag.tagNumber == 0x03) || (tag.tagNumber == 0x04))) {
      // sometimes BitString and OctetString are used to encapsulate ASN.1
      try {
        if (tag.tagNumber == 0x03) {
          if (stream.get() != 0) {
            throw "BIT STRINGs with unused bits cannot encapsulate.";
          }
        }
        getSub();
        for (let i = 0; i < sub.length; ++i) {
          if (sub[i].tag.isEOC()) {
            throw "EOC is not supposed to be actual content.";
          }
        }
      } catch (e) {
        // but silently ignore when they don't
        sub = null;
        // DEBUG console.log('Could not decode structure at ' + start + ':', e);
      }
    }
    if (sub === null) {
      if (len === null) {
        throw "We can't skip over an invalid tag with undefined length at offset " + start;
      }
      stream.pos = start + Math.abs(len);
    }
    return new ASN1(streamStart, header, len, tag, tagLen, sub);
  };

  return ASN1;
});
