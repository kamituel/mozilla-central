/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et cindent: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Copyright © 2013 Deutsche Telekom, Inc. */

#include "MozNdefRecord.h"
#include "mozilla/dom/MozNdefRecordBinding.h"
#include "mozilla/HoldDropJSObjects.h"
#include "nsContentUtils.h"


namespace mozilla {
namespace dom {

NS_IMPL_CYCLE_COLLECTION_WRAPPERCACHE_1(MozNdefRecord, mWindow)
NS_IMPL_CYCLE_COLLECTING_ADDREF(MozNdefRecord)
NS_IMPL_CYCLE_COLLECTING_RELEASE(MozNdefRecord)
NS_INTERFACE_MAP_BEGIN_CYCLE_COLLECTION(MozNdefRecord)
  NS_WRAPPERCACHE_INTERFACE_MAP_ENTRY
  NS_INTERFACE_MAP_ENTRY(nsISupports)
NS_INTERFACE_MAP_END

void
MozNdefRecord::HoldData()
{
  mozilla::HoldJSObjects(this);
}

void
MozNdefRecord::DropData()
{
  if (mType) {
    mType = nullptr;
  }
  if (mId) {
    mId = nullptr;
  }
  if (mPayload) {
    mPayload = nullptr;
  }
  mozilla::DropJSObjects(this);
}

/* static */
already_AddRefed<MozNdefRecord>
MozNdefRecord::Constructor(const GlobalObject& aGlobal,
  uint8_t aTnf, const Uint8Array& aType, const Uint8Array& aId, const Uint8Array& aPayload,
  ErrorResult& aRv)
{
  nsCOMPtr<nsPIDOMWindow> win = do_QueryInterface(aGlobal.GetAsSupports());
  if (!win) {
    aRv.Throw(NS_ERROR_FAILURE);
    return nullptr;
  }

  nsRefPtr<MozNdefRecord> ndefrecord = new MozNdefRecord(aGlobal.GetContext(), win, aTnf, aType, aId, aPayload);
  if (!ndefrecord) {
    aRv.Throw(NS_ERROR_FAILURE);
    return nullptr;
  }
  return ndefrecord.forget();
}

MozNdefRecord::MozNdefRecord(JSContext* aCx, nsPIDOMWindow* aWindow, uint8_t aTnf, const Uint8Array& aType, const Uint8Array& aId, const Uint8Array& aPayload)
  : mTnf(aTnf)
{
  mWindow = aWindow; // For GetParentObject()

  mType = Uint8Array::Create(aCx, this, aType.Length(), aType.Data());
  mId = Uint8Array::Create(aCx, this, aId.Length(), aId.Data());
  mPayload = Uint8Array::Create(aCx, this, aPayload.Length(), aPayload.Data());

  SetIsDOMBinding();
  HoldData();
}

MozNdefRecord::~MozNdefRecord()
{
  DropData();
}

JSObject*
MozNdefRecord::WrapObject(JSContext* aCx, JS::Handle<JSObject*> aScope)
{
  return MozNdefRecordBinding::Wrap(aCx, aScope, this);
}

} // namespace dom
} // namespace mozilla
