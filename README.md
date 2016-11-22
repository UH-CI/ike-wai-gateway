## Agave ToGo

Agave ToGo v2 is a full-featured web application providing a reference user interface to exercising the core
functionality of the Agave Platform and demonstrate some of the advanced use cases which are possible by leveraging
the core Agave Core Science APIs and mainstream open source web technologies.

This version of the web application is implemented as a client-side application using the
[AngularJS framework](http://angularjs.org/). It is designed to run entirely within your browser with no need for a
back-end server. The Aside from the Agave Platform itself, there are no external third-party
service dependencies. The assets produced by this project are entirely static, thus you may host this application out
of your Bitbucket, GitHub, Dropbox, Google Drive, or even a folder you published using Agave.  

Agave ToGo is fully open source under the BSD 2-Clause license. We encourage you to fork the project and use it as
a jumping point from which you can build your own application. To contribute back enhancement and bug fixes, please
make a pull request on the branch you have forked.
***************************************************************************************************************************
## Install Agave ToGo for UH Tenant
* git clone git@github.com:UH-CI/uh-togo-app.git
* git checkout hawaii
* npm install
* npm install http-server -g
* npm start

If you want to make Agave ToGo use the Hawaii Tenant you need to create a client application in the Hawaii Tenant that users can use to access Agave. (NOTE the callbackUrl needs to match the machine that ToGo is deployed on - in this example it is on localhost on port 9000)
<pre>
curl -sku "uh-username:uh-password" -X POST -d "clientName=my-app-name&description=Client app for Agave ToGo&callbackUrl=http://localhost:9000/auth" https://agaveauth.its.hawaii.edu/clients/v2
</pre>

You should get a response that looks like:
<pre>
{"status": "success", "message": "Client created successfully.", "version": "2.0.0-SNAPSHOT-rc3fad", "result": {"description": "Client app for Agave ToGo", "name": "my-app-name", "consumerKey": "AizxkAa42cz3z4IMValzo2MAMgwa", "_links": {"subscriber": {"href": "https://agaveauth.its.hawaii.edu/profiles/v2/uh-username"}, "self": {"href": "https://agaveauth.its.hawaii.edu/clients/v2/my-app-name"}, "subscriptions": {"href": "https://agaveauth.its.hawaii.edu/clients/v2/my-app-name/subscriptions/"}}, "tier": "Unlimited", "consumerSecret": "zR923vrRojJNxC262HFFKPJlzGca", "callbackUrl": "http://localhost:9000/auth"}}
</pre>

The "consumerKey"and "callbackUrl" field values will be needed for the next part.

Now modify the auth/scripts/implicit.js file by adding:
<pre>
'hawaii': {
        'clientKey': 'AizxkAa42cz3z4IMValzo2MAMgwa',
        'callbackUrl': 'http://localhost:9000/auth',
        'scope': 'PRODUCTION'
    }
</pre>
This part is necessary to add Hawaii to the list of possible tenants and set the proper connection credentials.

You can add images for the drop down and tenant login with names hawaii.png and hawaii-thumb.png in auth/img/tenants/

Now run the following command from the root directory of the agave togo repo:
<pre>
npm start
</pre>
or
<pre>
http-server -a localhost -p 9000
</pre>

The app can be access at localhost:9000/auth




************************************************************************************************************************************
## Getting Started

To get you started you can simply clone the angular-seed repository and install the dependencies:

### Prerequisites

You need git to clone the `agave-togo` repository. You can get git from [http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test agave-togo. You must have node.js and its package manager (npm) installed. You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone agave-togo

Clone the agave-togo repository using [git](http://git-scm.com/):

```
git clone git@github.com:UH-CI/uh-togo-app.git  

cd agave-togo  
```

If you just want to start a new project without the agave-togo commit history then you can do:

```
git clone --depth=1 git@github.com:UH-CI/uh-togo-app.git <your-project-name>  
```

The `depth=1` tells git to only pull down one commit worth of historical data.

### Install Dependencies

We have two three of dependencies in this project: tools and Agave Platform SDKs, and the angular framework code. The tools help us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager](https://www.npmjs.org/).
* We get the Agave Platform SDKs and angular code via `bower`, a [client-side code package manager](http://bower.io/).  

We have pre-configured npm to automatically run bower so we can simply do:

```
npm install
```  

Behind the scenes this will also call `bower install`. You should find that you have two new folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `bower_components` - contains the angular framework files

### Configure clients

You must set your own `clientKey` and `callbackUrl` in `/agave-togo/auth/scripts/implicit.js` for authentication:

```
var OAuthClients = {
    'agave.prod': {
        'clientKey': 'B241…’,
        'callbackUrl': 'https://localhost:9000/auth/',
        'scope': 'PRODUCTION'
    },
    'iplantc.org': {
        'clientKey': 'USjf…’,
        'callbackUrl': 'https://localhost:9000/auth/',
        'scope': 'PRODUCTION'
    },
    'dev.staging': {
        'clientKey': 'FxWr…,
        'callbackUrl': 'https://localhost:9000/auth/',
        'scope': 'PRODUCTION'
    },
    'tacc.prod': {
        'clientKey': 'B4oW…’,
        'callbackUrl': 'https://localhost:9000/auth/',
        'scope': 'PRODUCTION'
    },
    'araport.org': {
        'clientKey': 'JsKm…’,
        'callbackUrl': 'https://localhost:9000/auth/',
        'scope': 'PRODUCTION'
    },
    'designsafe': {
        'clientKey': 'jNWc…’,
        'callbackUrl': 'https://localhost:9000/auth/',
        'scope': 'PRODUCTION'
    }
};
```

An easy way to register your client and obtain your `clientKey` and `callbackUrl` is through the CLI (https://bitbucket.org/agaveapi/cli):

```
$ tenants-init
Please select a tenant from the following list:
[0] agave.prod
[1] araport.org
[2] designsafe
[3] iplantc.org
[4] irec
[5] irmacs
[6] tacc.prod
[7] vdjserver.org
Your choice [3]: 0
You are now configured to interact with the APIs at https://public.agaveapi.co/

$ clients-create -N "agave_client" -C "https://localhost:9000/auth/" -S
API username : yourusername
API password: yourpassword
Successfully created client agave_client
key: 2YR...
secret: NaH3...

$ auth-check -v
{
  "tenantid": "agave.prod",
  "baseurl": "https://public.agaveapi.co",
  "devurl": "",
  "apisecret": "NaH3...",
  "apikey": "2YR...",
  "username": "yourusername",
  "access_token": "",
  "refresh_token": "",
  "created_at": "",
  "expires_in": "",
  "expires_at": ""
}
```

### Run the Application

We have preconfigured the project with a simple development web server. The simplest way to start this server is:

```
npm start
```

Now browse to the app at [http://localhost:9000/app](http://localhost:9000/app).

### Run tests (optional)

Set your tenant `BASEURI` and `oAuthAccessToken` on `/bower_components/agave-angularjs-sdk/Agave/TestConfiguration.js`:

```
Configuration.BASEURI = 'https://public.agaveapi.co';
Configuration.oAuthAccessToken = '37d51643...';
```

```
cd agave-togo
karma start
```

### Workflow

When you make changes, the workflow now is commit changes to dev branch, merge to test, test the changes, and finally merge to the hawaii branch.
