/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 /* Copyright © 2013 Deutsche Telekom, Inc. */

[JSImplementation="@mozilla.org/navigatorNfc;1",
 NavigatorProperty="mozNfc",
 Func="Navigator::HasNfcSupport"]
interface MozNfc : EventTarget {
   MozNFCTag getNFCTag(DOMString sessionId);
   MozNFCPeer getNFCPeer(DOMString sessionId);

   /**
    * API to validate if the top-most (visible) application's manifest
    * URL is registered with the Chrome Process or not.
    *
    * Returns success if given maifestUrl is registered for 'onpeerready',
    * otherwise error
    *
    * Users of this API should have valid permission 'nfc-manager'.
    */
   DOMRequest validateAppManifestUrl(DOMString manifestUrl);
   attribute EventHandler onpeerready;
   attribute EventHandler onpeerlost;
};
