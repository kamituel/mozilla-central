/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.0 (the "NPL"); you may not use this file except in
 * compliance with the NPL.  You may obtain a copy of the NPL at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the NPL is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the NPL
 * for the specific language governing rights and limitations under the
 * NPL.
 *
 * The Initial Developer of this code under the NPL is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation.  All Rights
 * Reserved.
 */


#include "nsSampleWordBreaker.h"

#include "pratom.h"
#include "nsLWBRKDll.h"
nsSampleWordBreaker::nsSampleWordBreaker()
{
  NS_INIT_REFCNT();
  PR_AtomicIncrement(&g_InstanceCount);
}
nsSampleWordBreaker::~nsSampleWordBreaker()
{
  PR_AtomicDecrement(&g_InstanceCount);
}

NS_DEFINE_IID(kIWordBreakerIID, NS_IWORDBREAKER_IID);

NS_IMPL_ISUPPORTS(nsSampleWordBreaker, kIWordBreakerIID);

nsresult nsSampleWordBreaker::BreakInBetween(
  const PRUnichar* aText1 , PRUint32 aTextLen1,
  const PRUnichar* aText2 , PRUint32 aTextLen2,
  PRBool *oCanBreak)
{
  // to be implement
  return NS_OK;
}

nsresult nsSampleWordBreaker::PostionToBoundary(
  const PRUnichar* aText1 , PRUint32 aTextLen1,
  PRUint32 *oWordBegin,
  PRUint32 *oWordEnd)
{
  // to be implement
  return NS_OK;
}

nsresult nsSampleWordBreaker::FirstForwardBreak(nsIBreakState* state)
{
  // to be implement
  state->Set(1, PR_TRUE);
  return NS_OK;
}
nsresult nsSampleWordBreaker::NextForwardBreak(nsIBreakState* state) 
{
  // to be implement
  PRBool done;
  state->IsDone(&done);
  if(! done)
  {
    PRUint32 pos;
    PRUint32 len;
    state->Current(&pos);
    pos += 1;
    state->Length(&len);
   
    state->Set(pos, (pos >= len));
  }
  return NS_OK;
}
