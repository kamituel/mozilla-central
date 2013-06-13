/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
#ifndef mozilla_dom_secureelement_SecureElementService_h
#define mozilla_dom_secureelement_SecureElementService_h

#include "nsCOMPtr.h"
#include "nsISecureElementService.h"
#include "nsISecureElementInterface.h"
#include "SEProvider.h"
#include "mozilla/StaticPtr.h"

namespace mozilla {
namespace dom {
namespace secureelement {

class SecureElementService
  : public nsISecureElementService
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISECUREELEMENTSERVICE

  static already_AddRefed<SecureElementService> GetInstance();

  void Init();

  int32_t mTest;
  //nsISEProvider getSecureElementProvider(long type);

private:

  static StaticRefPtr<SecureElementService> sSingleton;

  ~SecureElementService();

  
  int32_t mWatchdogTimeoutSecs;
};

} // namespace secureelement
} // namespace dom
} // namespace mozilla

#endif // mozilla_dom_secureelement_SecureElementService_h
