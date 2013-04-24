/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "SEProvider.h"
#include "SESession.h"

#include "nsDOMClassInfoID.h"
#include "nsIDocument.h"
#include "nsIPermissionManager.h"
#include "nsPIDOMWindow.h"
#include "nsError.h"
#include "nsCOMPtr.h"

DOMCI_DATA(SEProvider, mozilla::dom::secureelement::SEProvider)

namespace mozilla {
namespace dom {
namespace secureelement {

//NS_IMPL_CYCLE_COLLECTION_CLASS(SEProvider)
      
NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN_INHERITED(SEProvider,
                                                  nsDOMEventTargetHelper)
NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN_INHERITED(SEProvider,
                                                nsDOMEventTargetHelper)
NS_IMPL_CYCLE_COLLECTION_UNLINK_END

NS_INTERFACE_MAP_BEGIN_CYCLE_COLLECTION_INHERITED(SEProvider)
  NS_INTERFACE_MAP_ENTRY(nsISEProvider)
  NS_DOM_INTERFACE_MAP_ENTRY_CLASSINFO(SEProvider)
NS_INTERFACE_MAP_END_INHERITING(nsDOMEventTargetHelper)

NS_IMPL_ADDREF_INHERITED(SEProvider, nsDOMEventTargetHelper)
NS_IMPL_RELEASE_INHERITED(SEProvider, nsDOMEventTargetHelper)

nsresult
SEProvider::Init(nsPIDOMWindow* aWindow)
{
  LOG("Enter Init..");
  BindToOwner(aWindow->IsOuterWindow() ?
    aWindow->GetCurrentInnerWindow() : aWindow);

  return NS_OK;
}


/* attribute long type; */
NS_IMETHODIMP SEProvider::GetType(int32_t *aType)
{
  int32_t i;
  i++;
  return NS_OK;
}

NS_IMETHODIMP SEProvider::GetStatus(int32_t *aStatus)
{
  LOG("In SE Provider GetStatus");
  return NS_OK;
}

/* attribute long isSupported; */
NS_IMETHODIMP SEProvider::GetIsSupported(bool *aIsSupported)
{
  LOG("In SE Provider GetIsSupported");
  return NS_OK;
}

NS_IMETHODIMP SEProvider::GetProviderName(nsAString &retval)
{
  LOG("In SE Provider GetProviderName");
  return NS_OK;
}

NS_IMETHODIMP SEProvider::IsSESupported(bool *retval)
{
  LOG("Enter isSESupported... ");
  *retval = true;
  return NS_OK;
}

NS_IMETHODIMP SEProvider::Connect(nsISESessionCallBack *statusCallback, nsISESession **retval)
{
  LOG("In SE Provider Connect");
  nsRefPtr<SESession> seSession = new SESession(mSEType);
  seSession->Init(GetOwner());
  mCallback = statusCallback;
  if (NULL != mCallback) {
     //mCallback->notifySESessionStatusUpdates(0);
  }

  seSession.forget(retval);

  return NS_OK;
}

NS_IMETHODIMP SEProvider::Disconnect(bool *retval)
{
  LOG("In SE Provider DisConnect");
  return NS_OK;
}

} // secureelement
} // dom
} // mozilla

