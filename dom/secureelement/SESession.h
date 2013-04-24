/* -*- Mode: c++; c-basic-offset: 2; indent-tabs-mode: nil; tab-width: 40 -*- */
/* vim: set ts=2 et sw=2 tw=40: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_secureelement_SecureElementSession_h__
#define mozilla_dom_secureelement_SecureElementSession_h__

#include "nsISecureElementInterface.h"
#include "nsDOMEventTargetHelper.h"
#include "IccManager.h"
#include "nsIMobileConnectionProvider.h"
#include "nsCOMPtr.h"
#include "nsPIDOMWindow.h"

#include "nsServiceManagerUtils.h"
#include "nsINfcContentHelper.h"
#include "Nfc.h"

#undef LOG
#if defined(MOZ_WIDGET_GONK)
#include <android/log.h>
#define LOG(args...)  __android_log_print(ANDROID_LOG_INFO, "DBG:SESession" , ## args)
#else
#define LOG(args...)
#endif

#define NS_RILCONTENTHELPER_CONTRACTID "@mozilla.org/ril/content-helper;1"

class nsPIDOMWindow;

namespace mozilla {
namespace dom {
namespace secureelement {

class SESession : public nsDOMEventTargetHelper,
                  public nsISESession
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISESESSION
  NS_FORWARD_NSIDOMEVENTTARGET(nsDOMEventTargetHelper::)
  NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED(SESession,
                                           nsDOMEventTargetHelper)

  //static already_AddRefed<SESession>
  //Create();

  /*nsIDOMEventTarget*
  ToIDOMEventTarget() const
  {
    return static_cast<nsDOMEventTargetHelper*>(
             const_cast<SESession*>(this));
  }

  nsISupports*
  ToISupports() const
  {
    return ToIDOMEventTarget();
  }*/

  nsresult Init(nsPIDOMWindow *aWindow);

  SESession() { 
    LOG("Enter nSESession constructor"); 
    //mIccManager = new icc::IccManager();
    mCallback = nullptr;
  };

  SESession(uint32_t type)
  : mSEType(type) {
    LOG("Enter nSESession Param constructor");
    //mIccManager = new icc::IccManager();
    mProvider = do_GetService(NS_RILCONTENTHELPER_CONTRACTID);
    mNfcHelper = do_GetService(NS_NFCCONTENTHELPER_CONTRACTID);

    // Not being able to acquire the provider isn't fatal since we check
    // for it explicitly below.
    if (!mProvider) {
      //NS_WARNING("Could not acquire nsIMobileConnectionProvider!");
      LOG("Couldn't acquire RIL Helper ");
    } else {
      //mProvider->RegisterMobileConnectionMsg(NULL);
    }

   if (!mNfcHelper) {
      LOG("Couldn't acquire NFC Helper ");
   }
  };

  ~SESession() {
    if (mProvider) {
      //mIccManager->Shutdown();
      //mIccManager = nullptr;
      mProvider = nullptr;
    }
  };
private:
  uint32_t mSEType;
  //nsRefPtr<icc::IccManager> mIccManager;
  nsCOMPtr<nsIMobileConnectionProvider> mProvider;
  nsCOMPtr<nsISESessionCallBack> mCallback;
  nsCOMPtr<nsINfcContentHelper> mNfcHelper; 
};

} // namespace secureelement
} // namespace dom
} // namespace mozilla
#endif

