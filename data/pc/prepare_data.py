import requests
import json
import xmltodict
import xml.etree.ElementTree as ET
import os
import random

urls = [
    # "https://www.swas.polito.it/services/avcp/avcp_dataset_2015_annorif_2015.xml",
    # "https://www.swas.polito.it/services/avcp/avcp_dataset_2016_annorif_2016.xml",
    "https://www.swas.polito.it/services/avcp/avcp_dataset_2017_annorif_2017_1.xml",
    "https://www.swas.polito.it/services/avcp/avcp_dataset_2018_annorif_2018_1.xml",
    "https://www.unito.it/sites/default/files/legge190/2018/dataset_2018_00027.xml",
    "https://fire.rettorato.unito.it/gestione_bandi_gara/xml/dataset1.xml",
    "https://www.unito.it/sites/default/files/legge190/2017/dataset_2017_00007.xml"
]

for url in urls:
    res = requests.get(url)
    xml = "<" + res.text.split('<', 1)[-1]
    JSONrecord = json.loads(json.dumps(xmltodict.parse(xml)))

    print('Download XML files and store single contracts as json...\n')

    for lotto in JSONrecord["legge190:pubblicazione"]['data']['lotto']:
        # XXX Sometimes the cig is missing
        if lotto['cig'] is not None:
            filename = "input/" + lotto['cig'] + ".json"
            with open(filename, 'w', encoding='utf-8') as file:
                file.write(json.dumps(lotto, indent=2))

            print('Download and save complete!\n')

            print('Generate training KG...\n')

            # Create rdf files only from stored JSONs
            os.system("java -jar ../../jarql-1.0.1-SNAPSHOT.jar " +
                      filename + " ../training/pc/pc.query >> ../training/pc/final.ttl")
