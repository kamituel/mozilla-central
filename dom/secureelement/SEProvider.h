/* -*- Mode: c++; c-basic-offset: 2; indent-tabs-mode: nil; tab-width: 40 -*- */
/* vim: set ts=2 et sw=2 tw=40: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_secureelement_SecureElementProvider_h__
#define mozilla_dom_secureelement_SecureElementProvider_h__

#include "nsISecureElementInterface.h"
#include "nsDOMEventTargetHelper.h"
#include "nsCOMPtr.h"
#include "nsIDOMWindow.h"

#include "Nfc.h"

#undef LOG
#if defined(MOZ_WIDGET_GONK)
#include <android/log.h>
#define LOG(args...)  __android_log_print(ANDROID_LOG_INFO, "DBG:SEProvider" , ## args)
#else
#define LOG(args...)
#endif

class nsPIDOMWindow;

namespace mozilla {
namespace dom {
namespace secureelement {

class SEProvider : public nsDOMEventTargetHelper,
                   public nsISEProvider
{
public:
  NS_DECL_ISUPPORTS_INHERITED
  NS_DECL_NSISEPROVIDER
  NS_FORWARD_NSIDOMEVENTTARGET(nsDOMEventTargetHelper::)
  NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED(SEProvider,
                                           nsDOMEventTargetHelper)

  /*nsIDOMEventTarget*
  ToIDOMEventTarget() const
  {
    return static_cast<nsDOMEventTargetHelper*>(
             const_cast<SEProvider*>(this));
  }

  nsISupports*
  ToISupports() const
  {
    return ToIDOMEventTarget();
  }*/

  nsresult Init(nsPIDOMWindow *aWindow);
  SEProvider() { 
    LOG("Enter nSEProvider constructor"); 
    mCallback = nullptr;
  };
  ~SEProvider() {};
private:
  uint32_t mSEType;

  nsCOMPtr<nsISESessionCallBack> mCallback;
  
};

} // namespace secureelement
} // namespace dom
} // namespace mozilla
#endif

