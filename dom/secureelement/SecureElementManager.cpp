/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "nsDOMClassInfoID.h"
#include "nsIDOMWakeLockListener.h"
#include "nsIDocument.h"
#include "nsIPermissionManager.h"
//#include "nsIDOMSecureElementManager.h"
#include "nsPIDOMWindow.h"
#include "nsServiceManagerUtils.h"
#include "nsError.h"
#include "nsISecureElementService.h"
#include "SecureElementManager.h"
#include "SEProvider.h"
#include "nsCOMPtr.h"

DOMCI_DATA(SecureElementManager, mozilla::dom::secureelement::SecureElementManager)

namespace mozilla {
namespace dom {
namespace secureelement {

//NS_IMPL_CYCLE_COLLECTION_CLASS(SecureElementManager)

NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN_INHERITED(SecureElementManager,
                                                  nsDOMEventTargetHelper)
NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN_INHERITED(SecureElementManager,
                                                nsDOMEventTargetHelper)
NS_IMPL_CYCLE_COLLECTION_UNLINK_END

NS_IMPL_ADDREF_INHERITED(SecureElementManager, nsDOMEventTargetHelper)
NS_IMPL_RELEASE_INHERITED(SecureElementManager, nsDOMEventTargetHelper)

NS_INTERFACE_MAP_BEGIN_CYCLE_COLLECTION_INHERITED(SecureElementManager)
  NS_INTERFACE_MAP_ENTRY(nsIDOMSecureElementManager)
  NS_DOM_INTERFACE_MAP_ENTRY_CLASSINFO(SecureElementManager)
NS_INTERFACE_MAP_END_INHERITING(nsDOMEventTargetHelper)

/*nsresult
SecureElementManager::Init(nsIDOMWindow *aWindow)
{
  LOG("Enter Init..");
  mWindow = do_GetWeakReference(aWindow);
  nsCOMPtr<nsISecureElementService> seService =
    do_GetService(SECUREELEMENTSERVICE_CONTRACTID);
  NS_ENSURE_TRUE(seService, NS_ERROR_UNEXPECTED);

  return NS_OK;
}*/

nsresult
SecureElementManager::Init(nsPIDOMWindow* aWindow)
{
  LOG("Enter Init..");

  nsCOMPtr<nsISecureElementService> seService =
    do_GetService(SECUREELEMENTSERVICE_CONTRACTID);
  NS_ENSURE_TRUE(seService, NS_ERROR_UNEXPECTED);

  BindToOwner(aWindow->IsOuterWindow() ?
    aWindow->GetCurrentInnerWindow() : aWindow);

  return NS_OK;
}

nsresult
SecureElementManager::Shutdown()
{
  LOG("Enter Shutdown");
  /*nsCOMPtr<nsIPowerManagerService> pmService =
    do_GetService(POWERMANAGERSERVICE_CONTRACTID);
  NS_ENSURE_STATE(pmService);

  // Remove ourself from the global notification list.
  pmService->RemoveWakeLockListener(this);*/
  return NS_OK;
}

NS_IMETHODIMP
SecureElementManager::GetSecureElementProvider(int32_t type, nsISEProvider * *_retval)
{
 /* nsCOMPtr<nsISecureElementManagerService> seService =
    do_GetService(SECUREMANAGERSERVICE_CONTRACTID);
  NS_ENSURE_STATE(seService);

  return seService->getSecureElementProvider(type);*/

  LOG("Enter GetSecureElementProvider");
  //nsCOMPtr<nsISEProvider> seProvider(new SEProvider());
  nsRefPtr<SEProvider> seProvider = new SEProvider();
  seProvider->Init(GetOwner());

  seProvider.forget(_retval);

  return NS_OK;
}

NS_IMETHODIMP
SecureElementManager::GetEnabled(bool* aEnabled) 
{
  return NS_OK;
}

already_AddRefed<SecureElementManager>
SecureElementManager::CheckPermissionAndCreateInstance(nsPIDOMWindow* aWindow)
{
  LOG("Enter CheckPermissionAndCreateInstance");
  nsCOMPtr<nsIPermissionManager> permMgr =
    do_GetService(NS_PERMISSIONMANAGER_CONTRACTID);
  NS_ENSURE_TRUE(permMgr, nullptr);

  uint32_t permission = nsIPermissionManager::DENY_ACTION;
  permMgr->TestPermissionFromWindow(aWindow, "secureelement", &permission);

  if (permission != nsIPermissionManager::ALLOW_ACTION) {
    return nullptr;
  }

  nsRefPtr<SecureElementManager> seManager = new SecureElementManager();
  seManager->Init(aWindow);

  return seManager.forget();
}


} // secureelement
} // dom
} // mozilla
