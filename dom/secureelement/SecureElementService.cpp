/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "mozilla/Preferences.h"
#include "mozilla/Services.h"
#include "mozilla/ClearOnShutdown.h"
#include "nsIDOMWindow.h"
#include "nsIDOMSecureElementManager.h"
#include "SecureElementService.h"
#include "SEProvider.h"

// For _exit().
#ifdef XP_WIN
#include <process.h>
#else
#include <unistd.h>
#endif

#undef LOG
#if defined(MOZ_WIDGET_GONK)
#include <android/log.h>
#define LOG(args...)  __android_log_print(ANDROID_LOG_INFO, "DBG:SecElemService" , ## args)
#else
#define LOG(args...)
#endif

namespace mozilla {
namespace dom {
namespace secureelement {


NS_IMPL_ISUPPORTS1(SecureElementService, nsISecureElementService)

/* static */ StaticRefPtr<SecureElementService> SecureElementService::sSingleton;

/* static */ already_AddRefed<SecureElementService>
SecureElementService::GetInstance()
{
  LOG("Enter GetInstance");
  if (!sSingleton) {
    LOG("Enter Create Instance  ");
    sSingleton = new SecureElementService();
    sSingleton->Init();
    ClearOnShutdown(&sSingleton);
  } else {
    LOG("No need to create Instance ");
  }

  nsRefPtr<SecureElementService> service = sSingleton.get();
  return service.forget();
}

void
SecureElementService::Init()
{
  mTest++;
  LOG("Enter Svc Init   %d", mTest);
  mWatchdogTimeoutSecs =
    Preferences::GetInt("shutdown.watchdog.timeoutSecs", 5);
}

SecureElementService::~SecureElementService()
{
  LOG("Enter Svc destructor");
}

/*NS_IMETHODIMP
SecureElementService::getSecureElementProvider(long type)
{
  nsCOMPtr<nsISEProvider> seProvider(new SEProvider());
  //return seProvider;

  return NS_OK;
}*/


} // secureelement
} // dom
} // mozilla
