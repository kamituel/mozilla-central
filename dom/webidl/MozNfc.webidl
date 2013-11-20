/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 /* Copyright © 2013 Deutsche Telekom, Inc. */

[JSImplementation="@mozilla.org/navigatorNfc;1",
 NavigatorProperty="mozNfc"]
interface MozNfc : EventTarget {
   MozNFCTag getNFCTag(DOMString sessionId);
   MozNFCPeer getNFCPeer(DOMString sessionId);

   /**
    * API to update chrome about the top-most (visible)
    * application's manifest URL that is capable of
    * handling peer notifications.
    *
    * Users of this API should have valid permission 'nfc-manager'.
    */
   void setPeerWindow(DOMString manifestUrl);
   attribute EventHandler onpeerfound;
   attribute EventHandler onpeerlost;
};
