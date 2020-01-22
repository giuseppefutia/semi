#|/bin/bash

JSON=$1
QUERY=$2

CLEAN_QUERY="/tmp/query-"$(date +%s)
CLEAN_JSON="/tmp/json-"$(date +%s)

cat $QUERY | sed -e 's/-/trattino/g' > $CLEAN_QUERY
cat $JSON | sed -e 's/-/trattino/g' > $CLEAN_JSON

java -jar jarql-1.0.1-SNAPSHOT.jar $CLEAN_JSON $CLEAN_QUERY | sed 's/trattino/-/g'
