## Ike Wai Gateway

* git clone git@github.com:UH-CI/ike-togo-app.git
* git checkout hawaii
* npm install
* npm install http-server -g
* npm start

If you want to make IKE ToGo use the Hawaii Tenant you need to create a client application in the Hawaii Tenant that users can use to access Agave. (NOTE the callbackUrl needs to match the machine that ToGo is deployed on - in this example it is on localhost on port 9000)
<pre>
curl -sku "uh-username:uh-password" -X POST -d "clientName=my-app-name&description=Client app for Ike Wai Gateway &callbackUrl=http://localhost:9000/auth" https://agaveauth.its.hawaii.edu/clients/v2
</pre>

You should get a response that looks like:
<pre>
{"status": "success", "message": "Client created successfully.", "version": "2.0.0-SNAPSHOT-rc3fad", "result": {"description": "Client app for Ike Wai Gateway", "name": "my-app-name", "consumerKey": "AizxkAa42cz3z4IMValzo2MAMgwa", "_links": {"subscriber": {"href": "https://agaveauth.its.hawaii.edu/profiles/v2/uh-username"}, "self": {"href": "https://agaveauth.its.hawaii.edu/clients/v2/my-app-name"}, "subscriptions": {"href": "https://agaveauth.its.hawaii.edu/clients/v2/my-app-name/subscriptions/"}}, "tier": "Unlimited", "consumerSecret": "zR923vrRojJNxC262HFFKPJlzGca", "callbackUrl": "http://localhost:9000/auth"}}
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
