/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "nsIDOMClassInfo.h"
#include "nsDOMClassInfoID.h"
#include "nsContentUtils.h"
#include "nsNfcSecureElement.h"
#include "nsServiceManagerUtils.h"
#include "SystemWorkerManager.h"

#include "nsJSON.h"
#include "jsapi.h"
#include "jsfriendapi.h"
#include "NfcNdefEvent.h"

#include "nsNfc.h"
#include "Nfc.h"

#include <android/log.h>
#define LOG(args...)  __android_log_print(ANDROID_LOG_INFO, "Gonk NFC", args)

using namespace mozilla::dom::nfc;

static int mStaticTest;

// static
already_AddRefed<nsNfcSecureElement>
nsNfcSecureElement::Create(nsPIDOMWindow* aOwner, nsINfcContentHelper* aNfcHelper)
{
  LOG("DBG: 1. Create NfcSecureElemet.js");
  NS_ASSERTION(aOwner, "Null owner!");

  nsCOMPtr<nsIScriptGlobalObject> sgo = do_QueryInterface(aOwner);
  NS_ENSURE_TRUE(sgo, nullptr);

  nsCOMPtr<nsIScriptContext> scriptContext = sgo->GetContext();
  NS_ENSURE_TRUE(scriptContext, nullptr);
  
  LOG("DBG: 2. Create NfcSecureElemet");

  nsRefPtr<nsNfcSecureElement> nfcSE = new nsNfcSecureElement();

  nfcSE->BindToOwner(aOwner);

  nfcSE->mNfcHelper = aNfcHelper;

  LOG("DBG 1. : --- mTest  : \t %d,  mStaticTest : \t %d", nfcSE->mTest, mStaticTest);
  nfcSE->mTest++;
  mStaticTest++;

  LOG("DBG: 2.1 Create NfcSecureElemet ");
  LOG("DBG: 2.  --- mTest  : \t %d,  mStaticTest : \t %d", nfcSE->mTest, mStaticTest);

  return nfcSE.forget();
}

nsNfcSecureElement::nsNfcSecureElement()
{
mTest = mStaticTest = 0;
}

nsNfcSecureElement:: ~nsNfcSecureElement()
{
}

DOMCI_DATA(NfcSecureElement, nsNfcSecureElement)

//NS_IMPL_CYCLE_COLLECTION_CLASS(nsNfcSecureElement)

NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN_INHERITED(nsNfcSecureElement,
                                                  nsDOMEventTargetHelper)
  NS_IMPL_CYCLE_COLLECTION_TRAVERSE_SCRIPT_OBJECTS
NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

NS_IMPL_CYCLE_COLLECTION_TRACE_BEGIN_INHERITED(nsNfcSecureElement,
                                               nsDOMEventTargetHelper)
NS_IMPL_CYCLE_COLLECTION_TRACE_END

NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN_INHERITED(nsNfcSecureElement,
                                                nsDOMEventTargetHelper)
NS_IMPL_CYCLE_COLLECTION_UNLINK_END

NS_INTERFACE_MAP_BEGIN_CYCLE_COLLECTION_INHERITED(nsNfcSecureElement)
  NS_INTERFACE_MAP_ENTRY(nsIDOMNfcSecureElement)
  NS_DOM_INTERFACE_MAP_ENTRY_CLASSINFO(NfcSecureElement)
NS_INTERFACE_MAP_END_INHERITING(nsDOMEventTargetHelper)

NS_IMPL_ADDREF_INHERITED(nsNfcSecureElement, nsDOMEventTargetHelper)
NS_IMPL_RELEASE_INHERITED(nsNfcSecureElement, nsDOMEventTargetHelper)

nsresult
NS_NewNfcSecureElement(nsPIDOMWindow* aWindow, nsIDOMNfcSecureElement** aNfcSE)
{
  NS_ASSERTION(aWindow, "Null pointer!");

  // Check if Nfc exists and return null if it doesn't
  if(!mozilla::dom::gonk::SystemWorkerManager::IsNfcEnabled()) {
    *aNfcSE = nullptr;
    return NS_OK;
  }
  LOG("DBG: 1 In nsNewNfcSecureElemet....");

  // Make sure we're dealing with an inner window.
  nsPIDOMWindow* innerWindow = aWindow->IsInnerWindow() ?
                               aWindow :
                               aWindow->GetCurrentInnerWindow();
  LOG("DBG: 1.1 In nsNewNfcSecureElemet....");
  NS_ENSURE_TRUE(innerWindow, NS_ERROR_FAILURE);

  LOG("DBG: 1.2 In nsNewNfcSecureElemet....");
  // Make sure we're being called from a window that we have permission to
  // access.
  if (!nsContentUtils::CanCallerAccess(innerWindow)) {
    LOG("DBG: 1.3 In nsNewNfcSecureElemet....");
    return NS_ERROR_DOM_SECURITY_ERR;
  }

  nsCOMPtr<nsIDocument> document =
    do_QueryInterface(innerWindow->GetExtantDocument());
  NS_ENSURE_TRUE(document, NS_NOINTERFACE);

  LOG("DBG: 1.4 In nsNewNfcSecureElemet....");
  // Do security checks.
  nsCOMPtr<nsIURI> uri;
  //document->NodePrincipal()->GetURI(getter_AddRefs(uri));

  // Security checks passed, create object
  LOG("DBG: 2 In nsNewNfcSecureElemet");

  nsresult rv;
  nsCOMPtr<nsINfcContentHelper> nfcHelper =
    do_GetService(NS_NFCCONTENTHELPER_CONTRACTID, &rv);
  NS_ENSURE_SUCCESS(rv,rv);

  LOG("DBG: 1.5 In nsNewNfcSecureElemet....");
  nsRefPtr<nsNfcSecureElement> domNfcSE = nsNfcSecureElement::Create(innerWindow, nfcHelper);
  NS_ENSURE_TRUE(domNfcSE, NS_ERROR_UNEXPECTED);

  LOG("DBG: 3 In nsNewNfcSecureElemet");

  domNfcSE.forget(aNfcSE);
  return NS_OK;

}

NS_IMETHODIMP
nsNfcSecureElement::IccOpenChannel(const nsAString & aid, nsIDOMDOMRequest** aRequest)
{
   //MutexAutoLock lock(mMutex);

   LOG("DBG: Calling IccOpenChannel  : " );
   // Call to NfcContentHelper.js
   *aRequest = nullptr;
   LOG("DBG 3. : --- mTest  : \t %d,  mStaticTest : \t %d", this->mTest, mStaticTest);
  this->mTest++;
  mStaticTest++;

   LOG("DBG: 2.1 Create NfcSecureElemet ");
   LOG("DBG: 4.  --- mTest  : \t %d,  mStaticTest : \t %d", this->mTest, mStaticTest);

   nsresult rv = mNfcHelper->OpenChannel(GetOwner(), aid, aRequest);
   NS_ENSURE_SUCCESS(rv, rv);

   return NS_OK;
}

NS_IMETHODIMP 
nsNfcSecureElement::IccExchangeAPDU(int32_t channel, const JS::Value & apdu, nsIDOMDOMRequest** aRequest)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

NS_IMETHODIMP 
nsNfcSecureElement::IccCloseChannel(int32_t channel, nsIDOMDOMRequest** aRequest)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/*
NS_IMETHODIMP
nsNfc::SecureElementActivated(const nsAString& aSEMessage) {
  jsval result;
  nsresult rv;
  LOG("DBG: Secure Element Activated");
  nsIScriptContext* sc = GetContextForEventHandlers(&rv);
  NS_ENSURE_SUCCESS(rv, rv);
  if (!JS_ParseJSON(sc->GetNativeContext(), static_cast<const jschar*>(PromiseFlatString(aSEMessage).get()),
       aSEMessage.Length(), &result)) {
    LOG("DOM: Couldn't parse JSON for NFC Secure Element Activated");
    return NS_ERROR_UNEXPECTED;
  }

  // Dispatch incoming event.
  nsRefPtr<nsDOMEvent> event = NfcNdefEvent::Create(result);
  NS_ASSERTION(event, "This should never fail!");
  rv = event->InitEvent(NS_LITERAL_STRING("secureelementactivated"), false, false);
  NS_ENSURE_SUCCESS(rv, rv);

  bool dummy;
  rv = DispatchEvent(event, &dummy);
  NS_ENSURE_SUCCESS(rv, rv);

  return NS_OK;
}

NS_IMETHODIMP
nsNfc::SecureElementDeactivated(const nsAString& aSEMessage) {
  jsval result;
  nsresult rv;
  nsIScriptContext* sc = GetContextForEventHandlers(&rv);
  NS_ENSURE_SUCCESS(rv, rv);

  if (!JS_ParseJSON(sc->GetNativeContext(), static_cast<const jschar*>(PromiseFlatString(aSEMessage).get()),
       aSEMessage.Length(), &result)) {
    LOG("DOM: Couldn't parse JSON for NFC Secure Element Deactivated");
    return NS_ERROR_UNEXPECTED;
  }

  // Dispatch incoming event.
  nsRefPtr<nsDOMEvent> event = NfcNdefEvent::Create(result);
  NS_ASSERTION(event, "This should never fail!");

  rv = event->InitEvent(NS_LITERAL_STRING("secureelementdeactivated"), false, false);
  NS_ENSURE_SUCCESS(rv, rv);

  bool dummy;
  rv = DispatchEvent(event, &dummy);
  NS_ENSURE_SUCCESS(rv, rv);

  return NS_OK;
}

NS_IMETHODIMP
nsNfc::SecureElementTransaction(const nsAString& aSETransactionMessage)
{
  // Parse JSON
  jsval result;
  nsresult rv;
  nsIScriptContext* sc = GetContextForEventHandlers(&rv);
  NS_ENSURE_SUCCESS(rv, rv);

  if (!JS_ParseJSON(sc->GetNativeContext(), static_cast<const jschar*>(PromiseFlatString(aSETransactionMessage).get()),
       aSETransactionMessage.Length(), &result)) {
    LOG("DOM: Couldn't parse JSON for NFC Secure Element Transaction");
    return NS_ERROR_UNEXPECTED;
  }

  // Dispatch incoming event.
  nsRefPtr<nsDOMEvent> event = NfcNdefEvent::Create(result);
  NS_ASSERTION(event, "This should never fail!");

  rv = event->InitEvent(NS_LITERAL_STRING("secureelementtransaction"), false, false);
  NS_ENSURE_SUCCESS(rv, rv);

  bool dummy;
  rv = DispatchEvent(event, &dummy);
  NS_ENSURE_SUCCESS(rv, rv);

  return NS_OK;
}
*/
