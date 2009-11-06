//
// Autogenerated from Python template.  Hands off.
//

#include "IPDLUnitTests.h"

#include <string.h>

#include "base/command_line.h"
#include "base/string_util.h"

#include "IPDLUnitTestSubprocess.h"
#include "IPDLUnitTestThreadChild.h"

//-----------------------------------------------------------------------------
//===== TEMPLATED =====
${INCLUDES}
//-----------------------------------------------------------------------------

using mozilla::_ipdltest::IPDLUnitTestSubprocess;
using mozilla::_ipdltest::IPDLUnitTestThreadChild;

//-----------------------------------------------------------------------------
// data/functions accessed by both parent and child processes

namespace {
char* gIPDLUnitTestName = NULL; // "leaks"
}


namespace mozilla {
namespace _ipdltest {

const char* const
IPDLUnitTestName()
{
    if (!gIPDLUnitTestName) {
#if defined(OS_WIN)
        std::vector<std::wstring> args =
            CommandLine::ForCurrentProcess()->GetLooseValues();
        gIPDLUnitTestName = strdup(WideToUTF8(args[0]).c_str());
#elif defined(OS_POSIX)
        std::vector<std::string> argv =
            CommandLine::ForCurrentProcess()->argv();
        gIPDLUnitTestName = strdup(argv[1].c_str());
#else
#  error Sorry
#endif
    }
    return gIPDLUnitTestName;
}

} // namespace _ipdltest
} // namespace mozilla


namespace {

enum IPDLUnitTestType {
    NoneTest = 0,

//-----------------------------------------------------------------------------
//===== TEMPLATED =====
${ENUM_VALUES}
    
    LastTest = ${LAST_ENUM}
//-----------------------------------------------------------------------------
};


IPDLUnitTestType
IPDLUnitTestFromString(const char* const aString)
{
    if (!aString)
        return static_cast<IPDLUnitTestType>(0);
//-----------------------------------------------------------------------------
//===== TEMPLATED =====
${STRING_TO_ENUMS}
//-----------------------------------------------------------------------------
    else
        return static_cast<IPDLUnitTestType>(0);
}


const char* const
IPDLUnitTestToString(IPDLUnitTestType aTest)
{
    switch (aTest) {
//-----------------------------------------------------------------------------
//===== TEMPLATED =====
${ENUM_TO_STRINGS}
//-----------------------------------------------------------------------------

    default:
        return NULL;
    }
}


IPDLUnitTestType
IPDLUnitTest()
{
    return IPDLUnitTestFromString(mozilla::_ipdltest::IPDLUnitTestName());
}


} // namespace <anon>


//-----------------------------------------------------------------------------
// parent process only

namespace {
void* gParentActor = NULL;
}


namespace mozilla {
namespace _ipdltest {

void
IPDLUnitTestMain(void* aData)
{
    char* testString = reinterpret_cast<char*>(aData);
    IPDLUnitTestType test = IPDLUnitTestFromString(testString);
    if (!test) {
        // use this instead of |fail()| because we don't know what the test is
        fprintf(stderr, MOZ_IPDL_TESTFAIL_LABEL "| %s | unknown unit test %s\\n",
                "<--->", testString);
        NS_RUNTIMEABORT("can't continue");
    }
    gIPDLUnitTestName = testString;

    std::vector<std::string> testCaseArgs;
    testCaseArgs.push_back(testString);

    IPDLUnitTestSubprocess* subprocess = new IPDLUnitTestSubprocess();
    if (!subprocess->SyncLaunch(testCaseArgs))
        fail("problem launching subprocess");

    IPC::Channel* transport = subprocess->GetChannel();
    if (!transport)
        fail("no transport");

    base::ProcessHandle child = subprocess->GetChildProcessHandle();

    switch (test) {
//-----------------------------------------------------------------------------
//===== TEMPLATED =====
${PARENT_MAIN_CASES}
//-----------------------------------------------------------------------------

    default:
        fail("not reached");
        return;                 // unreached
    }
}

} // namespace _ipdltest
} // namespace mozilla


//-----------------------------------------------------------------------------
// child process only

namespace {
void* gChildActor = NULL;
}


namespace mozilla {
namespace _ipdltest {

void
IPDLUnitTestChildInit(IPC::Channel* transport,
                      base::ProcessHandle parent,
                      MessageLoop* worker)
{
    switch (IPDLUnitTest()) {
//-----------------------------------------------------------------------------
//===== TEMPLATED =====
${CHILD_INIT_CASES}
//-----------------------------------------------------------------------------

    default:
        fail("not reached");
        return;                 // unreached
    }
}

void IPDLUnitTestChildCleanUp()
{
    if (!gChildActor)
        return;

    switch (IPDLUnitTest()) {
//-----------------------------------------------------------------------------
//===== TEMPLATED =====
${CHILD_CLEANUP_CASES}
//-----------------------------------------------------------------------------

    default:
        fail("not reached");
        return;                 // unreached
    }
}

} // namespace _ipdltest
} // namespace mozilla
