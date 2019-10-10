import os
import json

# This script is used to generate a complete RDF file using a JARQL-serialized mapping
# It can be useful if you want to change the mapping (and JSONs are already available)

# Read the input directory getting all JSON files and materialize related RDF file
path = 'input/'
json_files = [j for j in os.listdir(path) if j.endswith('.json')]

for index, file in enumerate(json_files):
    # Create RDFs from JSONs using the pc.query mapping
    os.system('java -jar ../../jarql-1.0.1-SNAPSHOT.jar '
              + os.path.join(path, file) + ' ../training/pc/pc.query >> ../training/pc/complete.ttl')
