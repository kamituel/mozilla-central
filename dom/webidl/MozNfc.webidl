/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 /* Copyright © 2013 Deutsche Telekom, Inc. */

[JSImplementation="@mozilla.org/navigatorNfc;1",
 NavigatorProperty="mozNfc"]
interface MozNfc : EventTarget {

   /**
    * NDEF Functions
    */

   /* Get metadata details of the discovered and connected NDEF message */
   DOMRequest getDetailsNDEF();

   /* NDEF Read returns an array of NDEF Records consisting of 1 or more elements */
   DOMRequest readNDEF();

   /* NDEF Write records that is an array of 1 or more records */
   [Throws]
   DOMRequest writeNDEF(sequence<MozNdefRecord> records);

   /* Permanently make a physical NFC tag read only */
   DOMRequest makeReadOnlyNDEF();

   /**
    * Generic tag/tech functions
    */
   [Throws]
   DOMRequest connect(unsigned long techType);

   DOMRequest close();

};
