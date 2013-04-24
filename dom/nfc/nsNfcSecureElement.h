/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_nfc_nfcsecureelement_h
#define mozilla_dom_nfc_nfcsecureelement_h

#include "nsCOMPtr.h"
#include "nsDOMEventTargetHelper.h"

#include "nsIDOMNfcSecureElement.h"
#include "nsINfcContentHelper.h"
#include "nsINfcContentHelper.h"

#include "nsDOMEvent.h"

#define NS_NFC_CONTRACTID "@mozilla.org/nfc/nfc;1"

class nsPIDOMWindow;

nsresult
NS_NewNfcSecureElement(nsPIDOMWindow* aWindow, nsIDOMNfcSecureElement** aNfcSE);

namespace mozilla {
namespace dom {
namespace nfc {

class nsNfcSecureElement : public nsDOMEventTargetHelper, 
                           public nsIDOMNfcSecureElement
{
   nsCOMPtr<nsINfcContentHelper> mNfcHelper;
   
public:
  NS_DECL_ISUPPORTS_INHERITED
  NS_DECL_NSIDOMNFCSECUREELEMENT
  NS_FORWARD_NSIDOMEVENTTARGET(nsDOMEventTargetHelper::)
  NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_CLASS_INHERITED(
                                                   nsNfcSecureElement,
                                                   nsDOMEventTargetHelper)


  static already_AddRefed<nsNfcSecureElement>
  Create(nsPIDOMWindow* aOwner, nsINfcContentHelper* aNfc);

  //Mutex mMutex;
  int mTest;
  nsIDOMEventTarget*
  ToIDOMEventTarget() const
  {
    return static_cast<nsDOMEventTargetHelper*>(
             const_cast<nsNfcSecureElement*>(this));
  }

  nsISupports*
  ToISupports() const
  {
    return ToIDOMEventTarget();
  }

private:
  nsNfcSecureElement();
  ~nsNfcSecureElement();
};

} /* namespace nfc */
} /* namespace dom */
} /* namespace mozilla */

#endif //mozilla_dom_nfc_nfcsecureelement_h
