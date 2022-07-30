
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

const Int10 = require("./int10");
const oids = require("./oids");
const ellipsis = "\u2026";
const reTimeS = /^(\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;
const reTimeL = /^(\d\d\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;

function Stream(enc, pos) {
  if (enc instanceof Stream) {
    this.enc = enc.enc;
    this.pos = enc.pos;
  } else {
    // enc should be an array or a binary string
    this.enc = enc;
    this.pos = pos;
  }
}

const tableT61 = [
  ["", ""],
  ["AEIOUaeiou", "ÀÈÌÒÙàèìòù"], // Grave
  ["ACEILNORSUYZacegilnorsuyz", "ÁĆÉÍĹŃÓŔŚÚÝŹáćéģíĺńóŕśúýź"], // Acute
  ["ACEGHIJOSUWYaceghijosuwy", "ÂĈÊĜĤÎĴÔŜÛŴŶâĉêĝĥîĵôŝûŵŷ"], // Circumflex
  ["AINOUainou", "ÃĨÑÕŨãĩñõũ"], // Tilde
  ["AEIOUaeiou", "ĀĒĪŌŪāēīōū"], // Macron
  ["AGUagu", "ĂĞŬăğŭ"], // Breve
  ["CEGIZcegz", "ĊĖĠİŻċėġż"], // Dot
  ["AEIOUYaeiouy", "ÄËÏÖÜŸäëïöüÿ"], // Umlaut or diæresis
  ["", ""],
  ["AUau", "ÅŮåů"], // Ring
  ["CGKLNRSTcklnrst", "ÇĢĶĻŅŖŞŢçķļņŗşţ"], // Cedilla
  ["", ""],
  ["OUou", "ŐŰőű"], // Double Acute
  ["AEIUaeiu", "ĄĘĮŲąęįų"], // Ogonek
  ["CDELNRSTZcdelnrstz", "ČĎĚĽŇŘŠŤŽčďěľňřšťž"], // Caron
];

function stringCut(str, len) {
  if (str.length > len) {
    str = str.substring(0, len) + ellipsis;
  }
  return str;
}

function checkPrintable(s) {
  let i; let v;
  for (i = 0; i < s.length; ++i) {
    v = s.charCodeAt(i);
    if (v < 32 && v != 9 && v != 10 && v != 13) // [\t\r\n] are (kinda) printable
    {
      throw new Error("Unprintable character at index " + i + " (code " + s.str.charCodeAt(i) + ")");
    }
  }
}


Stream.prototype.parseOctetString = function(start, end, maxLength) {
  const len = end - start;
  let s;
  try {
    s = this.parseStringUTF(start, end, maxLength);
    checkPrintable(s.str);
    return {size: end - start, str: s.str};
  } catch (e) {
    // ignore
  }
  maxLength /= 2; // we work in bytes
  if (len > maxLength) {
    end = start + maxLength;
  }
  s = "";
  for (let i = start; i < end; ++i) {
    s += this.hexByte(this.get(i));
  }
  if (len > maxLength) {
    s += ellipsis;
  }
  return {size: len, str: s};
};
Stream.prototype.parseOID = function(start, end, maxLength) {
  let s = "";
  let n = new Int10();
  let bits = 0;
  for (let i = start; i < end; ++i) {
    const v = this.get(i);
    n.mulAdd(128, v & 0x7F);
    bits += 7;
    if (!(v & 0x80)) { // finished
      if (s === "") {
        n = n.simplify();
        if (n instanceof Int10) {
          n.sub(80);
          s = "2." + n.toString();
        } else {
          const m = n < 80 ? n < 40 ? 0 : 1 : 2;
          s = m + "." + (n - m * 40);
        }
      } else {
        s += "." + n.toString();
      }
      if (s.length > maxLength) {
        return stringCut(s, maxLength);
      }
      n = new Int10();
      bits = 0;
    }
  }
  if (bits > 0) {
    s += ".incomplete";
  }
  if (typeof oids === "object") {
    const oid = oids[s];
    if (oid) {
      if (oid.d) s += "\n" + oid.d;
      if (oid.c) s += "\n" + oid.c;
      if (oid.w) s += "\n(warning!)";
    }
  }
  return s;
};


Stream.prototype.parseStringT61 = function(start, end, maxLength) {
  // warning: this code is not very well tested so far
  function merge(c, d) {
    const t = tableT61[c - 0xC0];
    const i = t[0].indexOf(String.fromCharCode(d));
    return (i < 0) ? "\0" : t[1].charAt(i);
  }
  let s = ""; let c;
  for (let i = start; i < end; ++i) {
    c = this.get(i);
    if (c >= 0xA4 && c <= 0xBF) {
      s += "$¥#§¤\0\0«\0\0\0\0°±²³×µ¶·÷\0\0»¼½¾¿".charAt(c - 0xA4);
    } else if (c >= 0xE0 && c <= 0xFF) {
      s += "ΩÆÐªĦ\0ĲĿŁØŒºÞŦŊŉĸæđðħıĳŀłøœßþŧŋ\0".charAt(c - 0xE0);
    } else if (c >= 0xC0 && c <= 0xCF) {
      s += merge(c, this.get(++i));
    } else // using ISO 8859-1 for characters undefined (or equal) in T.61
    {
      s += String.fromCharCode(c);
    }
  }
  return {size: s.length, str: stringCut(s, maxLength)};
};
Stream.prototype.parseStringUTF = function(start, end, maxLength) {
  function ex(c) { // must be 10xxxxxx
    if ((c < 0x80) || (c >= 0xC0)) {
      throw new Error("Invalid UTF-8 continuation byte: " + c);
    }
    return (c & 0x3F);
  }
  function surrogate(cp) {
    if (cp < 0x10000) {
      throw new Error("UTF-8 overlong encoding, codepoint encoded in 4 bytes: " + cp);
    }
    // we could use String.fromCodePoint(cp) but let's be nice to older browsers and use surrogate pairs
    cp -= 0x10000;
    return String.fromCharCode((cp >> 10) + 0xD800, (cp & 0x3FF) + 0xDC00);
  }
  let s = "";
  for (let i = start; i < end; ) {
    const c = this.get(i++);
    if (c < 0x80) // 0xxxxxxx (7 bit)
    {
      s += String.fromCharCode(c);
    } else if (c < 0xC0) {
      throw new Error("Invalid UTF-8 starting byte: " + c);
    } else if (c < 0xE0) // 110xxxxx 10xxxxxx (11 bit)
    {
      s += String.fromCharCode(((c & 0x1F) << 6) | ex(this.get(i++)));
    } else if (c < 0xF0) // 1110xxxx 10xxxxxx 10xxxxxx (16 bit)
    {
      s += String.fromCharCode(((c & 0x0F) << 12) | (ex(this.get(i++)) << 6) | ex(this.get(i++)));
    } else if (c < 0xF8) // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx (21 bit)
    {
      s += surrogate(((c & 0x07) << 18) | (ex(this.get(i++)) << 12) | (ex(this.get(i++)) << 6) | ex(this.get(i++)));
    } else {
      throw new Error("Invalid UTF-8 starting byte (since 2003 it is restricted to 4 bytes): " + c);
    }
  }
  return {size: s.length, str: stringCut(s, maxLength)};
};
Stream.prototype.parseStringBMP = function(start, end, maxLength) {
  let s = ""; let hi; let lo;
  for (let i = start; i < end; ) {
    hi = this.get(i++);
    lo = this.get(i++);
    s += String.fromCharCode((hi << 8) | lo);
  }
  return {size: s.length, str: stringCut(s, maxLength)};
};
Stream.prototype.parseTime = function(start, end, shortYear) {
  let s = this.parseStringISO(start, end).str;
  const m = (shortYear ? reTimeS : reTimeL).exec(s);
  if (!m) {
    return "Unrecognized time: " + s;
  }
  if (shortYear) {
    // to avoid querying the timer, use the fixed range [1970, 2069]
    // it will conform with ITU X.400 [-10, +40] sliding window until 2030
    m[1] = +m[1];
    m[1] += (m[1] < 70) ? 2000 : 1900;
  }
  s = m[1] + "-" + m[2] + "-" + m[3] + " " + m[4];
  if (m[5]) {
    s += ":" + m[5];
    if (m[6]) {
      s += ":" + m[6];
      if (m[7]) {
        s += "." + m[7];
      }
    }
  }
  if (m[8]) {
    s += " UTC";
    if (m[8] != "Z") {
      s += m[8];
      if (m[9]) {
        s += ":" + m[9];
      }
    }
  }
  return s;
};
Stream.prototype.parseInteger = function(start, end) {
  let v = this.get(start);
  const neg = (v > 127);
  const pad = neg ? 255 : 0;
  let len;
  let s = "";
  // skip unuseful bits (not allowed in DER)
  while (v == pad && ++start < end) {
    v = this.get(start);
  }
  len = end - start;
  if (len === 0) {
    return neg ? "-1" : "0";
  }
  // show bit length of huge integers
  if (len > 4) {
    s = v;
    len <<= 3;
    while (((s ^ pad) & 0x80) == 0) {
      s <<= 1;
      --len;
    }
    s = "(" + len + " bit)\n";
  }
  // decode the integer
  if (neg) v = v - 256;
  const n = new Int10(v);
  for (let i = start + 1; i < end; ++i) {
    n.mulAdd(256, this.get(i));
  }
  return s + n.toString();
};
Stream.prototype.parseBitString = function(start, end, maxLength) {
  const unusedBits = this.get(start);
  if (unusedBits > 7) {
    throw "Invalid BitString with unusedBits=" + unusedBits;
  }
  const lenBit = ((end - start - 1) << 3) - unusedBits;
  let s = "";
  for (let i = start + 1; i < end; ++i) {
    const b = this.get(i);
    const skip = (i == end - 1) ? unusedBits : 0;
    for (let j = 7; j >= skip; --j) {
      s += (b >> j) & 1 ? "1" : "0";
    }
    if (s.length > maxLength) {
      s = stringCut(s, maxLength);
    }
  }
  return {size: lenBit, str: s};
};

Stream.prototype.get = function(pos) {
  if (pos === undefined) {
    pos = this.pos++;
  }
  if (pos >= this.enc.length) {
    throw "Requesting byte offset " + pos + " on a stream of length " + this.enc.length;
  }
  return (typeof this.enc == "string") ? this.enc.charCodeAt(pos) : this.enc[pos];
};
Stream.prototype.hexDigits = "0123456789ABCDEF";
Stream.prototype.hexByte = function(b) {
  return this.hexDigits.charAt((b >> 4) & 0xF) + this.hexDigits.charAt(b & 0xF);
};
Stream.prototype.hexDump = function(start, end, raw) {
  let s = "";
  for (let i = start; i < end; ++i) {
    s += this.hexByte(this.get(i));
    if (raw !== true) {
      switch (i & 0xF) {
        case 0x7: s += "  "; break;
        case 0xF: s += "\n"; break;
        default: s += " ";
      }
    }
  }
  return s;
};
const b64Safe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
Stream.prototype.b64Dump = function(start, end) {
  const extra = (end - start) % 3;
  let s = "";
  let i; let c;
  for (i = start; i + 2 < end; i += 3) {
    c = this.get(i) << 16 | this.get(i + 1) << 8 | this.get(i + 2);
    s += b64Safe.charAt(c >> 18 & 0x3F);
    s += b64Safe.charAt(c >> 12 & 0x3F);
    s += b64Safe.charAt(c >> 6 & 0x3F);
    s += b64Safe.charAt(c & 0x3F);
  }
  if (extra > 0) {
    c = this.get(i) << 16;
    if (extra > 1) c |= this.get(i + 1) << 8;
    s += b64Safe.charAt(c >> 18 & 0x3F);
    s += b64Safe.charAt(c >> 12 & 0x3F);
    if (extra == 2) s += b64Safe.charAt(c >> 6 & 0x3F);
  }
  return s;
};
Stream.prototype.isASCII = function(start, end) {
  for (let i = start; i < end; ++i) {
    const c = this.get(i);
    if (c < 32 || c > 176) {
      return false;
    }
  }
  return true;
};
Stream.prototype.parseStringISO = function(start, end, maxLength) {
  let s = "";
  for (let i = start; i < end; ++i) {
    s += String.fromCharCode(this.get(i));
  }
  return {size: s.length, str: stringCut(s, maxLength)};
};

module.exports = Stream;
