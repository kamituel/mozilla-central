/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "SESession.h"

#include "nsDOMClassInfoID.h"
#include "nsIDocument.h"
#include "nsIPermissionManager.h"
#include "nsPIDOMWindow.h"
#include "nsError.h"
#include "nsCOMPtr.h"

DOMCI_DATA(SESession, mozilla::dom::secureelement::SESession)

namespace mozilla {
namespace dom {
namespace secureelement {

//NS_IMPL_CYCLE_COLLECTION_CLASS(SESession)
      
NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN_INHERITED(SESession,
                                                  nsDOMEventTargetHelper)
NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN_INHERITED(SESession,
                                                nsDOMEventTargetHelper)
  tmp->mCallback = nullptr;
  tmp->mProvider = nullptr;
  tmp->mNfcHelper = nullptr;
NS_IMPL_CYCLE_COLLECTION_UNLINK_END

NS_INTERFACE_MAP_BEGIN_CYCLE_COLLECTION_INHERITED(SESession)
  NS_INTERFACE_MAP_ENTRY(nsISESession)
  NS_DOM_INTERFACE_MAP_ENTRY_CLASSINFO(SESession)
NS_INTERFACE_MAP_END_INHERITING(nsDOMEventTargetHelper)

NS_IMPL_ADDREF_INHERITED(SESession, nsDOMEventTargetHelper)
NS_IMPL_RELEASE_INHERITED(SESession, nsDOMEventTargetHelper)

nsresult
SESession::Init(nsPIDOMWindow* aWindow)
{
  LOG("SESession : Enter Init..");
  BindToOwner(aWindow->IsOuterWindow() ?
    aWindow->GetCurrentInnerWindow() : aWindow);

  return NS_OK;
}

NS_IMETHODIMP 
SESession::OpenChannel(const nsAString & aid, nsISESessionCallBack *sessionStatusCallback, nsIDOMDOMRequest * *_retval)
{
  LOG("In SE Session Open Channel");
  nsCOMPtr<nsPIDOMWindow> win = GetOwner();
  if (!win) {
    LOG("In SE Session Open Channel - NULL ");
    return NS_ERROR_UNEXPECTED;
  }
  
  //if (mProvider)
    //mProvider->IccOpenChannel(win,aid, _retval);

  if (mNfcHelper)
    mNfcHelper->OpenChannel(win,aid, _retval);
  return NS_OK;
}

NS_IMETHODIMP 
SESession::ExchangeAPDU(int32_t channel, const JS::Value & apdu, nsIDOMDOMRequest * *_retval)
{
  LOG("In SE Session xChange APDU");

  if (mProvider)
    mProvider->IccExchangeAPDU(GetOwner(), channel, apdu, _retval);

  //if (mNfcHelper)
    //mNfcHelper->ExchangeAPDU(GetOwner(), channel, apdu, _retval);

  return NS_OK;
}

NS_IMETHODIMP 
SESession::CloseChannel(int32_t channel, nsIDOMDOMRequest * *_retval)
{
  LOG("In SE Session Close Channel");

  //if (mProvider)
    //mProvider->IccCloseChannel(GetOwner(),channel,  _retval);
  LOG("Close Channel :  %d", channel);
  if (mNfcHelper)
    mNfcHelper->CloseChannel(GetOwner(),channel,  _retval);
  return NS_OK;
}

} // secureelement
} // dom
} // mozilla

