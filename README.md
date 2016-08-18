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

Next modify auth/scripts/filters/filters.js by adding:
<pre>
else if (tenantCode === 'hawaii') {
            return 'https://agaveauth.its.hawaii.edu/';
}
</pre>
This should already be dowe but if not then add the above.  This will make the Hawaii tenant show up in the drop down list for users to select as a method to connect to now.

The last file to modify in order to make ToGo utilize the Hawaii tenant is (This has to happend anytime you reinstall or update the bower component for the Agave Angular SDK)
bower_components/agave-angularjs-sdk/Agave/Controllers/TenantsController.js

Change  "var baseUri" to:
<pre>
 var baseUri = "http://agavecore.its.hawaii.edu"
</pre>

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

### Run the Application

We have preconfigured the project with a simple development web server. The simplest way to start this server is:

``` 
npm start 
``` 

Now browse to the app at [http://localhost:9000/app](http://localhost:9000/app).



