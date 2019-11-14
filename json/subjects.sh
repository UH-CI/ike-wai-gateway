#!/bin/bash
#
# upload subject metadata 
#
# author: jgeis@hawaii.edu
#

DIR="/Users/jgeis/Work/agave/foundation-cli/bin"
source "$DIR/common.sh"
source "$DIR/metadata-common.sh"

schemaId="5560776967454265831-242ac11f-0001-013"

#echo -e "\n auth: $auth"

while IFS=, read word uuid shortHeirarchy display fullHeirarchy
do
	echo -e "\n I got:$word|$uuid|$shortHeirarchy|$display|$fullHeirarchy"

	#cmd="curl -sk -H \"$auth\" -X POST -H \"Content-Type: application/json\" --data-binary '{
	cmd="metadata-addupdate -v -F - <<< '{
		\"schemaId\": \"$schemaId\",
		\"title\": \"Subject\",
		\"name\": \"Subject\",
		\"value\": {
			\"word\":$word,
			\"uuid\":$uuid,
			\"short_heirarchy\":$shortHeirarchy,
			\"full_heirarchy\":$fullHeirarchy,
			\"display\":$display
		},
		\"permissions\": [ 
			{
				\"username\": \"Public\",
				\"permission\": \"read\"
			},
			{
				\"username\": \"omeier\",
				\"permission\": \"all\"
			},
			{
				\"username\": \"seanbc\",
				\"permission\": \"all\"
			}
		]
	}'"
	#}'  https://agaveauth.its.hawaii.edu/meta/v2/schemas/"

	#curl -sk -H "Authorization: Bearer 958a8831b265364a228e91a73f29d" -X POST -H "Content-Type: application/json" --data-binary '
	#cmd="curl -sk -H \"$auth\" -X POST -H \"Content-Type: application/json\" --data-binary $json"

	echo -e "\ncommand: $cmd"
	cleanCmd=${cmd//[$'\t\r\n']}
	echo $cleanCmd

	eval "$cleanCmd"

	#response=`curl -sk -H "${authheader}" -X POST -H \"Content-Type: application/json\" --data-binary $json`
	#response=`$cleanCmd`
	#echo -e "\nresponse: $response \n\n"

	#if [[ $(jsonquery "$response" "status") = 'success' ]]; then
	#        result=$(format_api_json "$response")
	#        success "$result"
	#else
	#        errorresponse=$(jsonquery "$response" "message")
	#        err "$errorresponse"
	#fi

done < subjects.csv

