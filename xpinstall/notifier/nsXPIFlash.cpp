/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
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

#include "nsCOMPtr.h"
#include "nsIComponentManager.h"
#include "nsIGenericFactory.h"
#include "nsIRDFContainer.h"
#include "nsIRDFDataSource.h"
#include "nsIRDFService.h"
#include "nsIRDFRemoteDataSource.h"
#include "nsIServiceManager.h"
#include "nsISupports.h"
#include "nsRDFCID.h"


#define NC_XPIFLASH_SOURCES     "NC:SoftwareUpdateDataSources"
#define NC_XPIFLASH_PACKAGES    "NC:SoftwarePackages"

#define NC_RDF_FLASHROOT		"NC:FlashRoot"

#define NC_RDF_TYPE				"http://home.netscape.com/NC-rdf#type"
#define NC_RDF_SOURCE			"http://home.netscape.com/NC-rdf#source"
#define NC_RDF_DESCRIPTION		"http://home.netscape.com/NC-rdf#description"
#define NC_RDF_TIMESTAMP		"http://home.netscape.com/NC-rdf#timestamp"
#define NC_RDF_URL				"http://home.netscape.com/NC-rdf#url"
#define NC_RDF_CHILD			"http://home.netscape.com/NC-rdf#child"

#define NC_XPIFLASH_TYPE        "http://home.netscape.com/NC-rdf#XPInstallNotification"

#define NC_XPIFLASH_TITLE       "http://home.netscape.com/NC-rdf#title"
#define NC_XPIFLASH_REGKEY      "http://home.netscape.com/NC-rdf#version"
#define NC_XPIFLASH_VERSION     "http://home.netscape.com/NC-rdf#registryKey"
#define NC_XPIFLASH_DESCRIPTION	"http://home.netscape.com/NC-rdf#description"
#define NC_XPIFLASH_URL			"http://home.netscape.com/NC-rdf#url"

static NS_DEFINE_CID(kRDFServiceCID,   NS_RDFSERVICE_CID);
static NS_DEFINE_CID(kRDFContainerCID, NS_RDFCONTAINER_CID);

class nsXPINotifierImpl : public nsISupports
{

public:
    static NS_IMETHODIMP New(nsISupports* aOuter, REFNSIID aIID, void** aResult);
    
private:
    
    nsXPINotifierImpl();
    virtual ~nsXPINotifierImpl();

    nsresult Init();
    nsresult SynchronouslyOpenRemoteDataSource(const char* aURL, nsIRDFDataSource** aResult);
    nsresult AddNewSoftwareFromDistributor(nsIRDFResource *inDistributor);

    nsCOMPtr<nsIRDFDataSource> mInner;
    nsIRDFService* mRDF;


    static nsIRDFResource* kXPI_NotifierSources;
    static nsIRDFResource* kXPI_NotifierPackages;
    static nsIRDFResource* kXPI_NotifierPackage_Title;
    static nsIRDFResource* kXPI_NotifierPackage_Version;
    static nsIRDFResource* kXPI_NotifierPackage_Description;
    static nsIRDFResource* kXPI_NotifierPackage_RegKey;
    static nsIRDFResource* kXPI_NotifierPackage_URL;
    static nsIRDFResource* kXPI_Notifier_Type;


    static nsIRDFResource* kNC_FlashRoot;
	static nsIRDFResource* kNC_Type;
	static nsIRDFResource* kNC_Source;
	static nsIRDFResource* kNC_Description;
	static nsIRDFResource* kNC_TimeStamp;
	static nsIRDFResource* kNC_URL;
	static nsIRDFResource* kNC_Child;
	
    // nsISupports interface
    NS_DECL_ISUPPORTS
};

nsIRDFResource* nsXPINotifierImpl::kXPI_NotifierSources = nsnull;
nsIRDFResource* nsXPINotifierImpl::kXPI_NotifierPackages = nsnull;
nsIRDFResource* nsXPINotifierImpl::kXPI_NotifierPackage_Title = nsnull;
nsIRDFResource* nsXPINotifierImpl::kXPI_NotifierPackage_Version = nsnull;
nsIRDFResource* nsXPINotifierImpl::kXPI_NotifierPackage_Description = nsnull;
nsIRDFResource* nsXPINotifierImpl::kXPI_NotifierPackage_RegKey = nsnull;
nsIRDFResource* nsXPINotifierImpl::kXPI_NotifierPackage_URL = nsnull;
nsIRDFResource* nsXPINotifierImpl::kXPI_Notifier_Type = nsnull;

nsIRDFResource* nsXPINotifierImpl::kNC_FlashRoot = nsnull;
nsIRDFResource* nsXPINotifierImpl::kNC_Type = nsnull;
nsIRDFResource* nsXPINotifierImpl::kNC_Source = nsnull;
nsIRDFResource* nsXPINotifierImpl::kNC_Description = nsnull;
nsIRDFResource* nsXPINotifierImpl::kNC_TimeStamp = nsnull;
nsIRDFResource* nsXPINotifierImpl::kNC_URL = nsnull;
nsIRDFResource* nsXPINotifierImpl::kNC_Child = nsnull;


nsXPINotifierImpl::nsXPINotifierImpl()
    : mRDF(nsnull)
{
    NS_INIT_REFCNT();
}


nsXPINotifierImpl::~nsXPINotifierImpl()
{
    if (mRDF) 
    {
        nsServiceManager::ReleaseService(kRDFServiceCID, mRDF);
        mRDF = nsnull;
    }

    NS_IF_RELEASE(kXPI_NotifierSources);
    NS_IF_RELEASE(kXPI_NotifierPackages);
    NS_IF_RELEASE(kXPI_NotifierPackage_Title);
    NS_IF_RELEASE(kXPI_NotifierPackage_Version);
    NS_IF_RELEASE(kXPI_NotifierPackage_Description);
    NS_IF_RELEASE(kXPI_NotifierPackage_RegKey);
    NS_IF_RELEASE(kXPI_NotifierPackage_URL);

    NS_IF_RELEASE(kXPI_Notifier_Type);

   	NS_IF_RELEASE(kNC_FlashRoot);
	NS_IF_RELEASE(kNC_Type);
	NS_IF_RELEASE(kNC_Source);
	NS_IF_RELEASE(kNC_Description);
	NS_IF_RELEASE(kNC_TimeStamp);
	NS_IF_RELEASE(kNC_URL);
	NS_IF_RELEASE(kNC_Child);
}


nsresult
nsXPINotifierImpl::Init()
{
    static NS_DEFINE_CID(kRDFInMemoryDataSourceCID, NS_RDFINMEMORYDATASOURCE_CID);

    nsresult rv;
    nsCOMPtr<nsIRDFDataSource> distributors;
    nsCOMPtr<nsIRDFContainer> distributorsContainer;
    nsCOMPtr <nsISimpleEnumerator> distributorEnumerator;
    PRBool moreElements;
    

    rv = nsComponentManager::CreateInstance(kRDFInMemoryDataSourceCID,
                                            this, /* the "outer" */
                                            nsIRDFDataSource::GetIID(),
                                            getter_AddRefs(mInner));
    if (NS_FAILED(rv)) return rv;

    // Read the distributor registry
    rv = nsServiceManager::GetService(kRDFServiceCID, nsIRDFService::GetIID(), (nsISupports**) &mRDF);
    if (NS_FAILED(rv)) return rv;
    
    if (! kXPI_NotifierSources)
	{
	   mRDF->GetResource(NC_XPIFLASH_SOURCES,       &kXPI_NotifierSources);
       mRDF->GetResource(NC_XPIFLASH_PACKAGES,      &kXPI_NotifierPackages);
       mRDF->GetResource(NC_XPIFLASH_TITLE,         &kXPI_NotifierPackage_Title);
       mRDF->GetResource(NC_XPIFLASH_VERSION,       &kXPI_NotifierPackage_Version);
       mRDF->GetResource(NC_XPIFLASH_DESCRIPTION,   &kXPI_NotifierPackage_Description);
       mRDF->GetResource(NC_XPIFLASH_REGKEY,        &kXPI_NotifierPackage_RegKey);
       mRDF->GetResource(NC_XPIFLASH_URL,           &kXPI_NotifierPackage_URL);

       mRDF->GetResource(NC_XPIFLASH_TYPE,          &kXPI_Notifier_Type);
              
       mRDF->GetResource(NC_RDF_FLASHROOT,          &kNC_FlashRoot);
	   mRDF->GetResource(NC_RDF_TYPE,               &kNC_Type);
	   mRDF->GetResource(NC_RDF_SOURCE,             &kNC_Source);
	   mRDF->GetResource(NC_RDF_DESCRIPTION,        &kNC_Description);
	   mRDF->GetResource(NC_RDF_TIMESTAMP,          &kNC_TimeStamp);
	   mRDF->GetResource(NC_RDF_URL,                &kNC_URL);
	   mRDF->GetResource(NC_RDF_CHILD,              &kNC_Child);

	}

    rv = SynchronouslyOpenRemoteDataSource("resource:/res/xpinstall/SoftwareUpdates.rdf", 
                                           getter_AddRefs(distributors));
    if (NS_FAILED(rv)) return rv;

    rv = nsComponentManager::CreateInstance(kRDFContainerCID,
                                            nsnull,
                                            nsIRDFContainer::GetIID(),
                                            getter_AddRefs(distributorsContainer));

    if (NS_SUCCEEDED(rv))
    {
        rv = distributorsContainer->Init(distributors, kXPI_NotifierSources);
        
        if (NS_SUCCEEDED(rv))
        {
            rv = distributorsContainer->GetElements(getter_AddRefs(distributorEnumerator));

            if (NS_SUCCEEDED(rv))
            {
                distributorEnumerator->HasMoreElements(&moreElements);
                while (moreElements) 
                {
                    nsCOMPtr<nsISupports> i;
                    rv = distributorEnumerator->GetNext(getter_AddRefs(i));
                    if (NS_FAILED(rv)) break;

                    nsCOMPtr<nsIRDFResource> aDistributor(do_QueryInterface(i, &rv));
                    if (NS_FAILED(rv)) break;

                    rv = AddNewSoftwareFromDistributor(aDistributor);
                    if (NS_FAILED(rv)) break;

                    distributorEnumerator->HasMoreElements(&moreElements);
                }
            }
        }
    }
    return NS_OK;
}

nsresult 
nsXPINotifierImpl::AddNewSoftwareFromDistributor(nsIRDFResource *inDistributor)
{
    char* uri;
    inDistributor->GetValue(&uri);
    
    if (uri == nsnull) return NS_ERROR_NULL_POINTER;
        
    nsCOMPtr<nsIRDFDataSource> distributorDataSource;
    nsCOMPtr<nsIRDFContainer> distributorContainer;
    nsCOMPtr <nsISimpleEnumerator> packageEnumerator;
    PRBool moreElements;

    nsresult rv = SynchronouslyOpenRemoteDataSource(uri, getter_AddRefs(distributorDataSource));
    if (NS_FAILED(rv)) return rv;

    
    rv = nsComponentManager::CreateInstance(kRDFContainerCID,
                                            nsnull,
                                            nsIRDFContainer::GetIID(),
                                            getter_AddRefs(distributorContainer));
    if (NS_SUCCEEDED(rv))
    {
        rv = distributorContainer->Init(distributorDataSource, kXPI_NotifierPackages);
        if (NS_SUCCEEDED(rv))
        {
            rv = distributorContainer->GetElements(getter_AddRefs(packageEnumerator));
            if (NS_SUCCEEDED(rv))
            {
                packageEnumerator->HasMoreElements(&moreElements);
                while (moreElements) 
                {
                    nsCOMPtr<nsISupports> i;

                    rv = packageEnumerator->GetNext(getter_AddRefs(i));
                    if (NS_FAILED(rv)) break;

                    nsCOMPtr<nsIRDFResource> aPackage(do_QueryInterface(i, &rv));
                    if (NS_FAILED(rv)) break;

                    // do whatever here
        
                    nsCOMPtr<nsIRDFNode> nameNode;
                    distributorDataSource->GetTarget(aPackage, 
                                                     kXPI_NotifierPackage_Title, 
                                                     PR_TRUE, 
                                                     getter_AddRefs(nameNode));

                    nsCOMPtr<nsIRDFLiteral> title(do_QueryInterface(nameNode, &rv));
                    if (NS_FAILED(rv)) break;
                   
                    // lets asert now..
                    
                    nsCOMPtr<nsIRDFLiteral> source;
                    nsString sourceString = "Software Notification";
        
                    rv = mRDF->GetLiteral(sourceString.GetUnicode(), getter_AddRefs(source));
                    mInner->Assert(aPackage, kNC_Type, kXPI_Notifier_Type, PR_TRUE);
                    mInner->Assert(aPackage, kNC_Source, source, PR_TRUE);
                    mInner->Assert(aPackage, kNC_Description, title, PR_TRUE);
                    

                    //Supposedly rdf will convert this into a localized time string.
                    nsCOMPtr<nsIRDFLiteral> timeStamp;
                    nsString timeStampString;

	                PRExplodedTime explode;
	                PR_ExplodeTime( PR_Now(), PR_LocalTimeParameters, &explode);
	                char buffer[128];
	                PR_FormatTime(buffer, sizeof(buffer), "%m/%d/%Y %I:%M %p", &explode);
	                timeStampString = buffer;
	
	                rv = mRDF->GetLiteral(timeStampString.GetUnicode(), getter_AddRefs(timeStamp));
	                if(NS_SUCCEEDED(rv))
	                {
		                mInner->Assert(aPackage, kNC_TimeStamp, timeStamp, PR_TRUE);
	                }

	                nsCOMPtr<nsIRDFNode> urlNode;
                    distributorDataSource->GetTarget(aPackage, 
                                                     kXPI_NotifierPackage_URL, 
                                                     PR_TRUE, 
                                                     getter_AddRefs(urlNode));

                    nsCOMPtr<nsIRDFLiteral> url(do_QueryInterface(urlNode, &rv));
                    if (NS_FAILED(rv)) break;
                    
                    mInner->Assert(aPackage, kNC_URL, url, PR_TRUE);
	                
                    mInner->Assert(kNC_FlashRoot, kNC_Child, aPackage, PR_TRUE);
                
                }
            }
        }
    }
    
    return NS_OK;
}


nsresult
nsXPINotifierImpl::SynchronouslyOpenRemoteDataSource(const char* aURL,
                                                              nsIRDFDataSource** aResult)
{
    static NS_DEFINE_CID(kRDFXMLDataSourceCID, NS_RDFXMLDATASOURCE_CID);
    nsresult rv;

    nsCOMPtr<nsIRDFRemoteDataSource> remote;
    rv = nsComponentManager::CreateInstance(kRDFXMLDataSourceCID,
                                            nsnull,
                                            nsIRDFRemoteDataSource::GetIID(),
                                            getter_AddRefs(remote));
    if (NS_FAILED(rv)) return rv;

    rv = remote->Init(aURL);
    if (NS_SUCCEEDED(rv)) {
        rv = remote->Refresh(PR_TRUE);
        if (NS_FAILED(rv)) return rv;

        nsCOMPtr<nsIRDFDataSource> result = do_QueryInterface(remote, &rv);
        *aResult = result;
        NS_IF_ADDREF(*aResult);
        return rv;
    }
    else {
        // we've already loaded this datasource. use cached copy
        return mRDF->GetDataSource(aURL, aResult);
    }
}


NS_IMETHODIMP
nsXPINotifierImpl::New(nsISupports* aOuter, REFNSIID aIID, void** aResult)
{
    NS_PRECONDITION(aOuter == nsnull, "no aggregation");
    if (aOuter)
        return NS_ERROR_NO_AGGREGATION;

    nsXPINotifierImpl* result = new nsXPINotifierImpl();
    if (! result)
        return NS_ERROR_OUT_OF_MEMORY;

    NS_ADDREF(result); // stabilize

    nsresult rv;
    rv = result->Init();
    if (NS_SUCCEEDED(rv)) {
        rv = result->QueryInterface(aIID, aResult);
    }

    NS_RELEASE(result);
    return rv;
}

////////////////////////////////////////////////////////////////////////
// nsISupports

NS_IMPL_ADDREF(nsXPINotifierImpl);

NS_IMETHODIMP_(nsrefcnt)
nsXPINotifierImpl::Release()
{
    --mRefCnt;
    if (mRefCnt == 1 && mInner) {
        mInner = nsnull; /* nsCOMPtr triggers Release() */
    }
    else if (mRefCnt == 0) {
        delete this;
    }
    return mRefCnt;
}

NS_IMETHODIMP
nsXPINotifierImpl::QueryInterface(REFNSIID aIID, void** aResult)
{
    NS_PRECONDITION(aResult != nsnull, "null ptr");
    if (! aResult)
        return NS_ERROR_NULL_POINTER;

    static NS_DEFINE_IID(kISupportsIID, NS_ISUPPORTS_IID);

    if (aIID.Equals(kISupportsIID)) {
        *aResult = NS_STATIC_CAST(nsISupports*, this);
    }
    else if (aIID.Equals(nsIRDFDataSource::GetIID())) {
        *aResult = mInner;
    }
    else {
        *aResult = nsnull;
        return NS_NOINTERFACE;
    }

    NS_ADDREF(this);
    return NS_OK;
}



////////////////////////////////////////////////////////////////////////
// Component Manager Related Exports

// {69FDC800-4050-11d3-BE2F-00104BDE6048}
#define NS_XPIUPDATENOTIFIER_CID \
{ 0x69fdc800, 0x4050, 0x11d3, { 0xbe, 0x2f, 0x0, 0x10, 0x4b, 0xde, 0x60, 0x48 } }

static NS_DEFINE_CID(kComponentManagerCID,       NS_COMPONENTMANAGER_CID);
static NS_DEFINE_CID(kGenericFactoryCID,         NS_GENERICFACTORY_CID);
static NS_DEFINE_CID(kXPIUpdateNotifierCID,      NS_XPIUPDATENOTIFIER_CID);


extern "C" PR_IMPLEMENT(nsresult)
NSGetFactory(nsISupports* aServiceMgr,
             const nsCID &aClass,
             const char *aClassName,
             const char *aProgID,
             nsIFactory **aFactory)
{
    NS_PRECONDITION(aFactory != nsnull, "null ptr");
    if (! aFactory)
        return NS_ERROR_NULL_POINTER;

    nsIGenericFactory::ConstructorProcPtr constructor;

    if (aClass.Equals(kXPIUpdateNotifierCID)) {
        constructor = nsXPINotifierImpl::New;
    }
    else {
        *aFactory = nsnull;
        return NS_NOINTERFACE; // XXX
    }

    nsresult rv;
    NS_WITH_SERVICE1(nsIComponentManager, compMgr, aServiceMgr, kComponentManagerCID, &rv);
    if (NS_FAILED(rv)) return rv;

    nsCOMPtr<nsIGenericFactory> factory;
    rv = compMgr->CreateInstance(kGenericFactoryCID,
                                 nsnull,
                                 nsIGenericFactory::GetIID(),
                                 getter_AddRefs(factory));

    if (NS_FAILED(rv)) return rv;

    rv = factory->SetConstructor(constructor);
    if (NS_FAILED(rv)) return rv;

    *aFactory = factory;
    NS_ADDREF(*aFactory);
    return NS_OK;
}



extern "C" PR_IMPLEMENT(nsresult)
NSRegisterSelf(nsISupports* aServMgr , const char* aPath)
{
    nsresult rv;

    nsCOMPtr<nsIServiceManager> servMgr(do_QueryInterface(aServMgr, &rv));
    if (NS_FAILED(rv)) return rv;

    NS_WITH_SERVICE1(nsIComponentManager, compMgr, servMgr, kComponentManagerCID, &rv);
    if (NS_FAILED(rv)) return rv;

    rv = compMgr->RegisterComponent(kXPIUpdateNotifierCID,
                                    "XPInstall Update Notifier",
                                    "component://netscape/rdf/datasource?name=xpinstall-update-notifier",
                                    aPath, PR_TRUE, PR_TRUE);

    return NS_OK;
}



extern "C" PR_IMPLEMENT(nsresult)
NSUnregisterSelf(nsISupports* aServMgr, const char* aPath)
{
    nsresult rv;

    nsCOMPtr<nsIServiceManager> servMgr(do_QueryInterface(aServMgr, &rv));
    if (NS_FAILED(rv)) return rv;

    NS_WITH_SERVICE1(nsIComponentManager, compMgr, servMgr, kComponentManagerCID, &rv);
    if (NS_FAILED(rv)) return rv;

    rv = compMgr->UnregisterComponent(kXPIUpdateNotifierCID, aPath);

    return NS_OK;
}
