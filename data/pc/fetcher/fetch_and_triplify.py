import requests
import json
import xmltodict
import xml.etree.ElementTree as ET
import os


urls = [
    #"https://www.swas.polito.it/services/avcp/avcp_dataset_2015_annorif_2015.xml",
    "https://www.swas.polito.it/services/avcp/avcp_dataset_2016_annorif_2016.xml",
    "https://www.swas.polito.it/services/avcp/avcp_dataset_2017_annorif_2017_1.xml",
    "https://www.swas.polito.it/services/avcp/avcp_dataset_2018_annorif_2018_1.xml",
    "https://www.unito.it/sites/default/files/legge190/2018/dataset_2018_00027.xml",
    "https://fire.rettorato.unito.it/gestione_bandi_gara/xml/dataset1.xml",
    "https://www.unito.it/sites/default/files/legge190/2017/dataset_2017_00007.xml"
]


for url in urls:
    res = requests.get(url)

    xml = "<" + res.text.split('<', 1)[-1]
    #print(xml)
    JSONrecord = json.loads(json.dumps(xmltodict.parse(xml)))
    #print(JSONrecord)
    for lotto in JSONrecord["legge190:pubblicazione"]['data']['lotto']:
        print(lotto)
        if "partecipanti" in lotto.keys():
            if lotto["partecipanti"] != None:
                lotto["partecipanti"] = lotto["partecipanti"]["partecipante"]
        if "aggiudicatari" in lotto.keys():
            if lotto["aggiudicatari"] != None:
                if "aggiudicatario" in lotto["aggiudicatari"].keys():
                    lotto["aggiudicatari"] = lotto["aggiudicatari"]["aggiudicatario"]
                elif "aggiudicatario" in lotto["aggiudicatari"].keys():
                    lotto["aggiudicatari"] = lotto["aggiudicatari"]["aggiudicatarioRaggruppamento"]['membro']

        filename = lotto['cig'] + ".json"

        with open(filename, 'w', encoding='utf-8') as tmp_file:
            tmp_file.write(json.dumps(lotto, indent=2))
        #json.dump(lotto, "file.json", indent=2)
        os.system("java -jar jarql-1.0.0.jar "+ filename + " ../gold/semantic_models/Z4ADEA9DE4_sm.query >> final.ttl")
