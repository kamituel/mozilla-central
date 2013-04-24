/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
#ifndef mozilla_dom_secureelement_SecureElementManager_h
#define mozilla_dom_secureelement_SecureElementManager_h

#include "nsCOMPtr.h"
//#include "nsTArray.h"
#include "nsIDOMSecureElementManager.h"
//#include "nsIDOMWakeLockListener.h"
#include "nsIDOMWindow.h"
#include "nsWeakReference.h"
#include "nsISecureElementInterface.h"
#include "nsDOMEventTargetHelper.h"

class nsPIDOMWindow;

#undef LOG
#if defined(MOZ_WIDGET_GONK)
#include <android/log.h>
#define LOG(args...)  __android_log_print(ANDROID_LOG_INFO, "DBG:SecElemMgr" , ## args)
#else
#define LOG(args...)
#endif

namespace mozilla {
namespace dom {
namespace secureelement {

class SecureElementManager
  : public nsIDOMSecureElementManager,
    public nsDOMEventTargetHelper
{
public:
  NS_DECL_ISUPPORTS_INHERITED
  NS_DECL_NSIDOMSECUREELEMENTMANAGER
  NS_FORWARD_NSIDOMEVENTTARGET(nsDOMEventTargetHelper::)
  /*NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_CLASS_INHERITED(
                                                   SecureElementManager,
                                                   nsDOMEventTargetHelper)*/

  //NS_DECL_NSISEPROVIDER

  SecureElementManager() { LOG("DBG: Ooops Sec Elem - I am here"); };
  virtual ~SecureElementManager() {};

  nsresult Init(nsPIDOMWindow *aWindow);
  nsresult Shutdown();

  static already_AddRefed<SecureElementManager>
  CheckPermissionAndCreateInstance(nsPIDOMWindow*);
  NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED(SecureElementManager,
                                           nsDOMEventTargetHelper)

/*
  nsIDOMEventTarget*
  ToIDOMEventTarget() const
  {
    return static_cast<nsDOMEventTargetHelper*>(
             const_cast<SecureElementManager*>(this));
  }

  nsISupports*
  ToISupports() const
  {
    return ToIDOMEventTarget();
  }
*/
private:

  nsWeakPtr mWindow;
  //nsTArray<nsCOMPtr<nsIDOMMozWakeLockListener> > mListeners;
};

} // namespace secureelement
} // namespace dom
} // namespace mozilla

#endif // mozilla_dom_secureelement_SecureElementManager_h
