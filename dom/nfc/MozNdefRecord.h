/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et cindent: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Copyright © 2013 Deutsche Telekom, Inc. */

#ifndef mozilla_dom_MozNdefRecord_h__
#define mozilla_dom_MozNdefRecord_h__

#include "mozilla/Attributes.h"
#include "mozilla/ErrorResult.h"
#include "nsCycleCollectionParticipant.h"
#include "nsWrapperCache.h"
#include "jsapi.h"

#include "nsIDocument.h"

#include "mozilla/dom/MozNdefRecordBinding.h"
#include "mozilla/dom/TypedArray.h"
#include "jsfriendapi.h"

struct JSContext;

namespace mozilla {
namespace dom {

class MozNdefRecord MOZ_FINAL : public nsISupports,
                                public nsWrapperCache
{
public:
  NS_DECL_CYCLE_COLLECTING_ISUPPORTS
  NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_CLASS(MozNdefRecord)

public:

  MozNdefRecord(nsPIDOMWindow* aWindow, uint8_t aTnf, const nsAString& aType, const nsAString& aId, const Uint8Array& aPlayload);

  ~MozNdefRecord();

  nsIDOMWindow* GetParentObject() const
  {
    return mWindow;
  }

  virtual JSObject* WrapObject(JSContext* aCx,
                               JS::Handle<JSObject*> aScope) MOZ_OVERRIDE;

  static already_AddRefed<MozNdefRecord> Constructor(const GlobalObject& aGlobal, uint8_t aTnf, const nsAString& aType, const nsAString& aId, const Uint8Array& aPayload, ErrorResult& aRv);

  uint8_t Tnf() const
  {
    return mTnf;
  }

  void GetType(nsString& aType) const
  {
    aType = mType;
  }

  void GetId(nsString& aId) const
  {
    aId = mId;
  }

  JSObject* Payload(JSContext* cx) const
  {
    return GetPayloadObject();
  }
  JSObject* GetPayloadObject() const
  {
    JS::ExposeObjectToActiveJS(mPayload);
    return mPayload;
  }

private:
  MozNdefRecord() MOZ_DELETE;
  nsRefPtr<nsPIDOMWindow> mWindow;
  void HoldData();
  void DropData();

  uint8_t mTnf;
  nsString mType;
  nsString mId;
  JS::Heap<JSObject*> mPayload;
};

} // namespace dom
} // namespace mozilla

#endif // mozilla_dom_MozNdefRecord_h__
