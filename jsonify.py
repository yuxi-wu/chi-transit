#source: https://stackoverflow.com/questions/38170071/csv-to-json-convertion-with-python

import csv
import json
import random

ROWTYPES = {'neighbourhood': str,
            'zhvi': int,
            'side': str}

def jsonify_csv(csvfile, jsonfile):
    with open(csvfile) as f:
        reader = csv.DictReader(f)
        reader = random.sample(list(reader),30)

        jsonfile = open(jsonfile, 'w')
        jsonfile.write('[')
        for row in reader:
            row_converted = {k: ROWTYPES[k](v) for k, v in row.items()}
            json.dump(row_converted, jsonfile)
            jsonfile.write(',\n')
        jsonfile.write(']')
